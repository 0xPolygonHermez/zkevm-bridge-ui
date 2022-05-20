import axios from "axios";
import { z } from "zod";

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

interface GetDepositsParams {
  apiUrl: string;
  ethereumAddress: string;
}

export const getDeposits = ({
  apiUrl,
  ethereumAddress,
}: GetDepositsParams): Promise<DepositOutput[]> => {
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

export const getClaimStatus = ({
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

export const getMerkleProof = ({
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

export const getClaims = ({ apiUrl, ethereumAddress }: GetClaimsParams): Promise<ClaimOutput[]> => {
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
