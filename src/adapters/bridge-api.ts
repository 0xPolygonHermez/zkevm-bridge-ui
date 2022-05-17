import axios from "axios";
import { z } from "zod";
import { BigNumber } from "ethers";

import { StrictSchema } from "src/utils/type-safety";
import * as domain from "src/domain";

interface DepositInput {
  token_addr: string;
  amount: string;
  network_id: number;
  orig_net: number;
  dest_net: number;
  dest_addr: string;
  deposit_cnt: string;
  tx_hash: string;
}

interface DepositOutput {
  token_addr: string;
  amount: string;
  network_id: number;
  orig_net: number;
  dest_net: number;
  dest_addr: string;
  deposit_cnt: number;
  tx_hash: string;
}

interface ClaimInput {
  index: string;
  network_id: number;
  tx_hash: string;
}

interface ClaimOutput {
  index: number;
  network_id: number;
  tx_hash: string;
}

interface MerkleProof {
  merkle_proof: string[];
  exit_root_num: string;
  l2_exit_root_num: string;
  main_exit_root: string;
  rollup_exit_root: string;
}

const depositParser = StrictSchema<DepositInput, DepositOutput>()(
  z.object({
    token_addr: z.string(),
    amount: z.string(),
    network_id: z.number(),
    orig_net: z.number(),
    dest_net: z.number(),
    dest_addr: z.string(),
    deposit_cnt: z.string().transform((v) => z.number().nonnegative().parse(Number(v))),
    tx_hash: z.string(),
  })
);

const getDepositsResponseParser = StrictSchema<
  {
    deposits?: DepositInput[];
  },
  {
    deposits?: DepositOutput[];
  }
>()(
  z.object({
    deposits: z.optional(z.array(depositParser)),
  })
);

const getClaimStatusResponseParser = StrictSchema<{
  ready?: boolean;
}>()(
  z.object({
    ready: z.optional(z.boolean()),
  })
);

const apiMerkleProofToDomain = ({
  merkle_proof,
  exit_root_num,
  l2_exit_root_num,
  main_exit_root,
  rollup_exit_root,
}: MerkleProof): domain.MerkleProof => ({
  merkleProof: merkle_proof,
  l2ExitRootNumber: z.number().nonnegative().parse(Number(l2_exit_root_num)),
  exitRootNumber: z.number().nonnegative().parse(Number(exit_root_num)),
  mainExitRoot: main_exit_root,
  rollupExitRoot: rollup_exit_root,
});

const merkleProofParser = StrictSchema<MerkleProof, domain.MerkleProof>()(
  z
    .object({
      merkle_proof: z.array(z.string().length(66)),
      exit_root_num: z.string(),
      l2_exit_root_num: z.string(),
      main_exit_root: z.string().length(66),
      rollup_exit_root: z.string().length(66),
    })
    .transform(apiMerkleProofToDomain)
);

const getMerkleProofResponseParser = StrictSchema<
  {
    proof: MerkleProof;
  },
  {
    proof: domain.MerkleProof;
  }
>()(
  z.object({
    proof: merkleProofParser,
  })
);

const claimParser = StrictSchema<ClaimInput, ClaimOutput>()(
  z.object({
    index: z.string().transform((v) => z.number().nonnegative().parse(Number(v))),
    network_id: z.number(),
    tx_hash: z.string(),
  })
);

const getClaimsResponseParser = StrictSchema<
  {
    claims?: ClaimInput[];
  },
  {
    claims?: ClaimOutput[];
  }
>()(
  z.object({
    claims: z.optional(z.array(claimParser)),
  })
);

const getBridges = async ({
  env,
  ethereumAddress,
}: {
  env: domain.Env;
  ethereumAddress: string;
}): Promise<domain.Bridge[]> => {
  const apiUrl = env.bridgeApiUrl;
  const [apiDeposits, apiClaims] = await Promise.all([
    getDeposits({ apiUrl, ethereumAddress }),
    getClaims({ apiUrl, ethereumAddress }),
  ]);

  return await Promise.all(
    apiDeposits.map(async (apiDeposit): Promise<domain.Bridge> => {
      const { network_id, dest_net, amount, dest_addr, deposit_cnt, tx_hash, token_addr } =
        apiDeposit;

      const networkId = env.chains.find((chain) => chain.networkId === network_id);
      if (networkId === undefined) {
        throw new Error(
          `The specified network_id "${network_id}" can not be found in the list of supported Chains`
        );
      }

      const destinationNetwork = env.chains.find((chain) => chain.networkId === dest_net);
      if (destinationNetwork === undefined) {
        throw new Error(
          `The specified dest_net "${dest_net}" can not be found in the list of supported Chains`
        );
      }

      const token = Object.values(env.tokens).find((token) => token.address === token_addr);
      if (token === undefined) {
        throw new Error(
          `The specified token_addr "${token_addr}" can not be found in the list of supported Tokens`
        );
      }

      const deposit: domain.Deposit = {
        token,
        amount: BigNumber.from(amount),
        destinationAddress: dest_addr,
        depositCount: deposit_cnt,
        txHash: tx_hash,
        networkId,
        destinationNetwork,
      };

      const apiClaim = apiClaims.find(
        (claim) =>
          claim.index === deposit.depositCount &&
          claim.network_id === deposit.destinationNetwork.networkId
      );

      const id = `${deposit.depositCount}-${deposit.destinationNetwork.networkId}`;

      if (apiClaim) {
        return {
          status: "completed",
          id,
          deposit,
          claim: {
            txHash: apiClaim.tx_hash,
          },
        };
      }

      const claimStatus = await getClaimStatus({
        apiUrl,
        networkId: deposit.networkId.networkId,
        depositCount: deposit.depositCount,
      });

      if (claimStatus === false) {
        return {
          status: "initiated",
          id,
          deposit,
        };
      }

      const merkleProof = await getMerkleProof({
        apiUrl,
        networkId: deposit.networkId.networkId,
        depositCount: deposit.depositCount,
      });

      return {
        status: "on-hold",
        id,
        deposit,
        merkleProof,
      };
    })
  );
};

interface GetDepositsParams {
  apiUrl: string;
  ethereumAddress: string;
}

const getDeposits = ({ apiUrl, ethereumAddress }: GetDepositsParams): Promise<DepositOutput[]> => {
  return axios
    .request({
      baseURL: apiUrl,
      url: `/bridges/${ethereumAddress}`,
      method: "GET",
    })
    .then((res) => {
      const parsedData = getDepositsResponseParser.safeParse(res.data);

      if (parsedData.success) {
        return parsedData.data.deposits !== undefined ? parsedData.data.deposits : [];
      } else {
        throw parsedData.error;
      }
    });
};

interface GetClaimStatusParams {
  apiUrl: string;
  networkId: number;
  depositCount: number;
}

const getClaimStatus = ({
  apiUrl,
  networkId,
  depositCount,
}: GetClaimStatusParams): Promise<boolean> => {
  return axios
    .request({
      baseURL: apiUrl,
      url: `/claim-status`,
      method: "GET",
      params: {
        net_id: networkId,
        deposit_cnt: depositCount,
      },
    })
    .then((res) => {
      const parsedData = getClaimStatusResponseParser.safeParse(res.data);

      if (parsedData.success) {
        return parsedData.data.ready === true;
      } else {
        throw parsedData.error;
      }
    });
};

interface GetMerkleProofParams {
  apiUrl: string;
  networkId: number;
  depositCount: number;
}

const getMerkleProof = ({
  apiUrl,
  networkId,
  depositCount,
}: GetMerkleProofParams): Promise<domain.MerkleProof> => {
  return axios
    .request({
      baseURL: apiUrl,
      url: `/merkle-proofs`,
      method: "GET",
      params: {
        net_id: networkId,
        deposit_cnt: depositCount,
      },
    })
    .then((res) => {
      const parsedData = getMerkleProofResponseParser.safeParse(res.data);

      if (parsedData.success) {
        return parsedData.data.proof;
      } else {
        throw parsedData.error;
      }
    });
};

interface GetClaimsParams {
  apiUrl: string;
  ethereumAddress: string;
}

const getClaims = ({ apiUrl, ethereumAddress }: GetClaimsParams): Promise<ClaimOutput[]> => {
  return axios
    .request({
      baseURL: apiUrl,
      url: `/claims/${ethereumAddress}`,
      method: "GET",
    })
    .then((res) => {
      const parsedData = getClaimsResponseParser.safeParse(res.data);

      if (parsedData.success) {
        return parsedData.data.claims !== undefined ? parsedData.data.claims : [];
      } else {
        throw parsedData.error;
      }
    });
};

export { getBridges };
