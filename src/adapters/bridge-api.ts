import axios from "axios";
import { z } from "zod";
import { BigNumber } from "ethers";

import { StrictSchema } from "src/utils/type-safety";
import * as domain from "src/domain";

interface Bridge {
  token_addr: string;
  amount: string;
  dest_net: 0 | 1;
  dest_addr: string;
  deposit_cnt?: string;
}

interface Claim {
  index: string;
  block_num: string;
}

interface MerkleProof {
  merkle_proof: string[];
  exit_root_num: string;
  main_exit_root: string;
  rollup_exit_root: string;
}

interface GetBridgesParams {
  apiUrl: string;
  ethereumAddress: string;
}

interface GetTransactionsParams {
  apiUrl: string;
  ethereumAddress: string;
  env: domain.Env;
}

interface GetClaimStatusParams {
  apiUrl: string;
  originNetwork: number;
  depositCount: number;
}

interface GetMerkleProofParams {
  apiUrl: string;
  originNetwork: number;
  depositCount: number;
}

interface GetClaimsParams {
  apiUrl: string;
  ethereumAddress: string;
}

const apiBridgeToDomain = ({
  token_addr,
  amount,
  dest_addr,
  dest_net,
  deposit_cnt,
}: Bridge): domain.Bridge => ({
  tokenAddress: token_addr,
  amount: BigNumber.from(amount),
  destinationAddress: dest_addr,
  destinationNetwork: dest_net,
  depositCount: deposit_cnt ? z.number().positive().parse(Number(deposit_cnt)) : 0,
});

const bridgeParser = StrictSchema<Bridge, domain.Bridge>()(
  z
    .object({
      token_addr: z.string(),
      amount: z.string(),
      dest_net: z.union([z.literal(0), z.literal(1)]),
      dest_addr: z.string(),
      deposit_cnt: z.string().optional(),
    })
    .transform(apiBridgeToDomain)
);

const getBridgesResponseParser = StrictSchema<
  {
    deposits?: Bridge[];
  },
  {
    deposits?: domain.Bridge[];
  }
>()(
  z.object({
    deposits: z.optional(z.array(bridgeParser)),
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
  main_exit_root,
  rollup_exit_root,
}: MerkleProof): domain.MerkleProof => ({
  merkleProof: merkle_proof.map((v) => `0x${v}`),
  exitRootNumber: z.number().positive().parse(Number(exit_root_num)),
  mainExitRoot: main_exit_root,
  rollupExitRoot: rollup_exit_root,
});

const merkleProofParser = StrictSchema<MerkleProof, domain.MerkleProof>()(
  z
    .object({
      merkle_proof: z.array(z.string().length(64)),
      exit_root_num: z.string(),
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

const claimParser = StrictSchema<Claim>()(
  z.object({
    index: z.string(),
    block_num: z.string(),
  })
);

const apiClaimToDomain = ({ index, block_num }: Claim): domain.Claim => ({
  index: z.number().positive().parse(Number(index)),
  blockNumber: block_num,
});

const getClaimsResponseParser = StrictSchema<
  {
    claims?: Claim[];
  },
  {
    claims?: domain.Claim[];
  }
>()(
  z.object({
    claims: z.optional(z.array(claimParser.transform(apiClaimToDomain))),
  })
);

const getTransactions = async ({
  apiUrl,
  ethereumAddress,
  env,
}: GetTransactionsParams): Promise<domain.Transaction[]> => {
  const [bridges, claims] = await Promise.all([
    getBridges({ apiUrl, ethereumAddress }),
    getClaims({ apiUrl, ethereumAddress }),
  ]);

  /**
const apiBridgeToDomain = (
  { amount, dest_addr, dest_net, deposit_cnt }: Bridge,
  env: domain.Env
): domain.Bridge => {
  return {
    token: env.tokens.ETH,
    amount: BigNumber.from(amount),
    destinationAddress: dest_addr,
    destinationChain: dest_net === 0 ? env.chains[0] : env.chains[1],
    depositCount: deposit_cnt ? z.number().positive().parse(Number(deposit_cnt)) : 0,
  };
};
 */

  return await Promise.all(
    bridges.map(async (bridge): Promise<domain.Transaction> => {
      const { depositCount, destinationNetwork, amount, destinationAddress } = bridge;
      const originNetwork = destinationNetwork === 0 ? 1 : 0;
      const [claimStatus, merkleProof]: [domain.ClaimStatus, domain.MerkleProof] =
        await Promise.all([
          getClaimStatus({ apiUrl, originNetwork, depositCount }),
          getMerkleProof({ apiUrl, originNetwork, depositCount }),
        ]);
      const initiatedTransaction: domain.InitiatedTransaction = {
        token: env.tokens.ETH,
        destination: env.chains[destinationNetwork],
        origin: env.chains[originNetwork],
        amount,
        destinationAddress,
        depositCount,
      };
      if (claimStatus.isReady) {
        const claim = claims.find((claim) => claim.index === bridge.depositCount);
        return claim
          ? {
              ...initiatedTransaction,
              ...merkleProof,
              index: claim.index,
              blockNumber: claim.blockNumber,
              status: "completed",
            }
          : {
              ...initiatedTransaction,
              ...merkleProof,
              status: "on-hold",
            };
      } else {
        return {
          ...initiatedTransaction,
          status: "initiated",
        };
      }
    })
  );
};

const getBridges = ({ apiUrl, ethereumAddress }: GetBridgesParams): Promise<domain.Bridge[]> => {
  return axios
    .request({
      baseURL: apiUrl,
      url: `/bridges/${ethereumAddress}`,
      method: "GET",
    })
    .then((res) => {
      const parsedData = getBridgesResponseParser.safeParse(res.data);

      if (parsedData.success) {
        return parsedData.data.deposits !== undefined ? parsedData.data.deposits : [];
      } else {
        throw parsedData.error;
      }
    });
};

const getClaimStatus = ({
  apiUrl,
  originNetwork,
  depositCount,
}: GetClaimStatusParams): Promise<domain.ClaimStatus> => {
  return axios
    .request({
      baseURL: apiUrl,
      url: `/claim-status`,
      method: "GET",
      params: {
        origin_net: originNetwork,
        deposit_cnt: depositCount,
      },
    })
    .then((res) => {
      const parsedData = getClaimStatusResponseParser.safeParse(res.data);

      if (parsedData.success) {
        return parsedData.data.ready === true ? { isReady: true } : { isReady: false };
      } else {
        throw parsedData.error;
      }
    });
};

const getMerkleProof = ({
  apiUrl,
  originNetwork,
  depositCount,
}: GetMerkleProofParams): Promise<domain.MerkleProof> => {
  return axios
    .request({
      baseURL: apiUrl,
      url: `/merkle-proofs`,
      method: "GET",
      params: {
        origin_net: originNetwork,
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

const getClaims = ({ apiUrl, ethereumAddress }: GetClaimsParams): Promise<domain.Claim[]> => {
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

export { getTransactions };
