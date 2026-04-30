// Public entry point for ENS-style named address resolution.
//
// Both forward and reverse default to v2 (UniversalResolver — one call, picks
// up ENSIP-10 wildcards and on-chain dispatch flows that v1 misses). The
// Blockbook-based path is currently unavailable, so callers reach the chain
// directly through these RPC clients.
//
// Both versions are re-exported with explicit `*v1` / `*v2` names so callers
// that need a specific path can opt in.
export { buildCalldata, resolveViaRPCv1, reverseViaRPCv1 } from './resolveNamedAddressV1';
export { resolveViaRPCv2, reverseViaRPCv2 } from './resolveNamedAddressV2';
export { OffchainLookupError } from './rpc';

import { resolveViaRPCv2, reverseViaRPCv2 } from './resolveNamedAddressV2';

export const resolveViaRPC = resolveViaRPCv2;
export const reverseViaRPC = reverseViaRPCv2;
