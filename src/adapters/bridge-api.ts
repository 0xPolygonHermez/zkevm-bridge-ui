import axios from "axios";
import { z } from "zod";
import { BigNumber } from "ethers";

import { StrictSchema } from "src/utils/type-safety";
import * as domain from "src/domain";

interface BridgeInput {
  token_addr: string;
  amount: string;
  network_id: number;
  orig_net: number;
  dest_net: number;
  dest_addr: string;
  deposit_cnt: string;
}

interface BridgeOutput {
  token_addr: string;
  amount: string;
  network_id: number;
  orig_net: number;
  dest_net: number;
  dest_addr: string;
  deposit_cnt: number;
}

interface ClaimInput {
  index: string;
  network_id: number;
}

interface ClaimOutput {
  index: number;
  network_id: number;
}

interface MerkleProof {
  merkle_proof: string[];
  exit_root_num: string;
  l2_exit_root_num: string;
  main_exit_root: string;
  rollup_exit_root: string;
}

const apiBridgeToDomain = ({
  bridge: { amount, dest_addr, deposit_cnt },
  token,
  networkId,
  destinationNetwork,
}: {
  bridge: BridgeOutput;
  token: domain.Token;
  networkId: domain.Chain;
  destinationNetwork: domain.Chain;
}): domain.Bridge => {
  return {
    amount: BigNumber.from(amount),
    destinationAddress: dest_addr,
    depositCount: deposit_cnt,
    networkId,
    token,
    destinationNetwork,
  };
};

const bridgeParser = StrictSchema<BridgeInput, BridgeOutput>()(
  z.object({
    token_addr: z.string(),
    amount: z.string(),
    network_id: z.number(),
    orig_net: z.number(),
    dest_net: z.number(),
    dest_addr: z.string(),
    deposit_cnt: z.string().transform((v) => z.number().nonnegative().parse(Number(v))),
  })
);

const getBridgesResponseParser = StrictSchema<
  {
    deposits?: BridgeInput[];
  },
  {
    deposits?: BridgeOutput[];
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

interface GetTransactionsParams {
  env: domain.Env;
  ethereumAddress: string;
}

const getTransactions = async ({
  env,
  ethereumAddress,
}: GetTransactionsParams): Promise<domain.Transaction[]> => {
  const apiUrl = env.bridgeApiUrl;
  const [bridges, claims] = await Promise.all([
    getBridges({ apiUrl, ethereumAddress }),
    getClaims({ apiUrl, ethereumAddress }),
  ]);

  return await Promise.all(
    bridges
      .filter(
        (apiBridge) =>
          apiBridge.token_addr === env.tokens.ETH.address &&
          apiBridge.orig_net === env.tokens.ETH.network
      )
      .map(async (apiBridge): Promise<domain.Transaction> => {
        const networkId = env.chains.find((chain) => chain.networkId === apiBridge.network_id);
        if (networkId === undefined) {
          throw new Error(
            `The specified network_id "${apiBridge.network_id}" can not be found in the list of supported Chains`
          );
        }

        const destinationNetwork = env.chains.find(
          (chain) => chain.networkId === apiBridge.dest_net
        );
        if (destinationNetwork === undefined) {
          throw new Error(
            `The specified dest_net "${apiBridge.dest_net}" can not be found in the list of supported Chains`
          );
        }

        const bridge = apiBridgeToDomain({
          bridge: apiBridge,
          token: env.tokens.ETH,
          networkId,
          destinationNetwork,
        });

        const claim = claims.find(
          (claim) =>
            claim.index === bridge.depositCount &&
            claim.network_id === bridge.destinationNetwork.networkId
        );

        const id = `${bridge.depositCount}-${bridge.destinationNetwork.networkId}`;

        if (claim) {
          return {
            status: "completed",
            id,
            bridge,
          };
        }

        const claimStatus = await getClaimStatus({
          apiUrl,
          networkId: bridge.networkId.networkId,
          depositCount: bridge.depositCount,
        });

        if (claimStatus === false) {
          return {
            status: "initiated",
            id,
            bridge,
          };
        }

        const merkleProof = await getMerkleProof({
          apiUrl,
          networkId: bridge.networkId.networkId,
          depositCount: bridge.depositCount,
        });

        return {
          status: "on-hold",
          id,
          bridge,
          merkleProof,
        };
      })
  );
};

interface GetBridgesParams {
  apiUrl: string;
  ethereumAddress: string;
}

const getBridges = ({ apiUrl, ethereumAddress }: GetBridgesParams): Promise<BridgeOutput[]> => {
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

export { getTransactions };
