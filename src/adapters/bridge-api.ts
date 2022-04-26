import axios from "axios";
import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import * as domain from "src/domain";
import { BigNumber } from "ethers";

interface Bridge {
  token_addr: string;
  amount: string;
  dest_net: number;
  dest_addr: string;
  deposit_cnt?: string;
}

interface Claim {
  index: string;
  token_addr: string;
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
      dest_net: z.number(),
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
    token_addr: z.string(),
    block_num: z.string(),
  })
);

const apiClaimToDomain = ({ index, token_addr, block_num }: Claim): domain.Claim => ({
  index: z.number().positive().parse(Number(index)),
  tokenAddress: token_addr,
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
}: GetTransactionsParams): Promise<domain.Transaction[]> => {
  const [onHoldBridges, claims] = await Promise.all([
    getBridges({ apiUrl, ethereumAddress }),
    getClaims({ apiUrl, ethereumAddress }),
  ]);
  return await Promise.all(
    onHoldBridges.map(async (onHoldBridge): Promise<domain.Transaction> => {
      const { depositCount, destinationNetwork } = onHoldBridge;
      const originNetwork = destinationNetwork === 0 ? 1 : 0;
      const [claimStatus, merkleProof]: [domain.ClaimStatus, domain.MerkleProof] =
        await Promise.all([
          getClaimStatus({ apiUrl, originNetwork, depositCount }),
          getMerkleProof({ apiUrl, originNetwork, depositCount }),
        ]);
      if (claimStatus.isReady) {
        const claim = claims.find((claim) => claim.index === onHoldBridge.depositCount);
        return claim
          ? {
              ...onHoldBridge,
              ...merkleProof,
              index: claim.index,
              blockNumber: claim.blockNumber,
              step: "claimed",
            }
          : {
              ...onHoldBridge,
              ...merkleProof,
              step: "claimable",
            };
      } else {
        return {
          ...onHoldBridge,
          step: "on-hold",
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

export { getTransactions as getBridges, getClaimStatus, getMerkleProof, getClaims };
