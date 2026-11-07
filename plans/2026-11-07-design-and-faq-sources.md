# Design review and FAQ sources · November 7, 2026

## Design and editorial review

- [Claude Design critique and style guide](https://claude.ai/chat/cdd5b46f-0211-8be2-9061-511c450caada?artifact=bfe75dd4-6c92-4f65-9667-5c54354bb397)
- [Claude editorial review and erratum](https://claude.ai/chat/3d51845d-e442-4f37-b479-1514185e9e45)

## Can NanoClaw change my files?

- [CLI handler that serializes the request](https://github.com/nanocoai/nanoclaw/blob/5356b6c32be6e8c3e0dcd43f72e0041f88a6533c/src/cli/resources/groups.ts#L622-L645)
- [Matching a root](https://github.com/nanocoai/nanoclaw/blob/5356b6c32be6e8c3e0dcd43f72e0041f88a6533c/src/modules/mount-security/index.ts#L253-L269)
- [Path checks and the final write decision](https://github.com/nanocoai/nanoclaw/blob/5356b6c32be6e8c3e0dcd43f72e0041f88a6533c/src/modules/mount-security/index.ts#L305-L387)
- [Skill and setup field translation](https://github.com/nanocoai/nanoclaw/blob/5356b6c32be6e8c3e0dcd43f72e0041f88a6533c/src/modules/mount-security/index.ts#L86-L113)
- [Upstream test cases for legacy settings](https://github.com/nanocoai/nanoclaw/blob/5356b6c32be6e8c3e0dcd43f72e0041f88a6533c/src/modules/mount-security/index.test.ts#L57-L99)
- [Operator report #3690](https://github.com/nanocoai/nanoclaw/issues/3690)
- [Proposed CLI change #3742](https://github.com/nanocoai/nanoclaw/pull/3742)

## What carries over if I switch to Atomic Agent?

- [Transcript decision and structural comparison](https://github.com/AtomicBot-ai/atomic-agent/blob/fdc7813cb1b2d7a72781c957b211e03af5e02130/src/import/reconcile-session.ts#L40-L97)
- [Upstream transcript tests](https://github.com/AtomicBot-ai/atomic-agent/blob/fdc7813cb1b2d7a72781c957b211e03af5e02130/src/import/reconcile-session.test.ts)
- [OpenClaw schedule mapper](https://github.com/AtomicBot-ai/atomic-agent/blob/fdc7813cb1b2d7a72781c957b211e03af5e02130/src/import/openclaw/map-cron.ts#L59-L87)
- [OpenClaw schedule tests](https://github.com/AtomicBot-ai/atomic-agent/blob/fdc7813cb1b2d7a72781c957b211e03af5e02130/src/import/openclaw/map-cron.test.ts#L23-L93)
- [Hermes schedule mapper](https://github.com/AtomicBot-ai/atomic-agent/blob/fdc7813cb1b2d7a72781c957b211e03af5e02130/src/import/hermes/map-cron.ts#L56-L95)
- [Hermes schedule tests](https://github.com/AtomicBot-ai/atomic-agent/blob/fdc7813cb1b2d7a72781c957b211e03af5e02130/src/import/hermes/map-cron.test.ts#L19-L98)
- [Merged change #370](https://github.com/AtomicBot-ai/atomic-agent/pull/370)
