import axios from "axios";
import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import * as domain from "src/domain";

interface Bridge {
  token_addr: string;
  amount: string;
  dest_net: number;
  dest_addr: string;
  deposit_cnt: string;
}

interface Claim {
  index: string;
  token_addr: string;
  amount: string;
  dest_net: number;
  dest_addr: string;
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

interface GetBridgesResponse {
  deposits?: Bridge[];
}

interface GetClaimStatusResponse {
  ready?: boolean;
}

interface GetMerkleProofResponse {
  proof: MerkleProof;
}

interface GetClaimsResponse {
  claims?: Claim[];
}

const bridgeParser = StrictSchema<Bridge>()(
  z.object({
    token_addr: z.string(),
    amount: z.string(),
    dest_net: z.number(),
    dest_addr: z.string(),
    deposit_cnt: z.string(),
  })
);

const getBridgesResponseParser = StrictSchema<GetBridgesResponse>()(
  z.object({
    deposits: z.optional(z.array(bridgeParser)),
  })
);

const getClaimStatusResponseParser = StrictSchema<GetClaimStatusResponse>()(
  z.object({
    ready: z.optional(z.boolean()),
  })
);

const merkleProofParser = StrictSchema<MerkleProof>()(
  z.object({
    merkle_proof: z.array(z.string()),
    exit_root_num: z.string(),
    main_exit_root: z.string(),
    rollup_exit_root: z.string(),
  })
);

const getMerkleProofResponseParser = StrictSchema<GetMerkleProofResponse>()(
  z.object({
    proof: merkleProofParser,
  })
);

const claimParser = StrictSchema<Claim>()(
  z.object({
    index: z.string(),
    token_addr: z.string(),
    amount: z.string(),
    dest_net: z.number(),
    dest_addr: z.string(),
    block_num: z.string(),
  })
);

const getClaimsResponseParser = StrictSchema<GetClaimsResponse>()(
  z.object({
    claims: z.optional(z.array(claimParser)),
  })
);

const apiBridgeToDomain = ({
  token_addr,
  amount,
  dest_addr,
  dest_net,
  deposit_cnt,
}: Bridge): domain.Bridge => ({
  tokenAddress: token_addr,
  amount: amount,
  destinationAddress: dest_addr,
  destinationNetwork: dest_net,
  depositCount: deposit_cnt,
});

const apiMerkleProofToDomain = ({
  merkle_proof,
  exit_root_num,
  main_exit_root,
  rollup_exit_root,
}: MerkleProof): domain.MerkleProof => ({
  merkleProof: merkle_proof,
  exitRootNumber: exit_root_num,
  mainExitRoot: main_exit_root,
  rollupExitRoot: rollup_exit_root,
});

const apiClaimToDomain = ({
  index,
  token_addr,
  amount,
  dest_net,
  dest_addr,
  block_num,
}: Claim): domain.Claim => ({
  index,
  tokenAddress: token_addr,
  amount,
  destinationNetwork: dest_net,
  destinationAddress: dest_addr,
  blockNumber: block_num,
});

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
        return parsedData.data.deposits !== undefined
          ? parsedData.data.deposits.map(apiBridgeToDomain)
          : [];
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
        return apiMerkleProofToDomain(parsedData.data.proof);
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
        return parsedData.data.claims !== undefined
          ? parsedData.data.claims.map(apiClaimToDomain)
          : [];
      } else {
        throw parsedData.error;
      }
    });
};

export { getBridges, getClaimStatus, getMerkleProof, getClaims };
