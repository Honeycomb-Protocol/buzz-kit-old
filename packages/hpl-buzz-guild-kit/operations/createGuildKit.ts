import * as web3 from "@solana/web3.js"
import { createCtx, HIVECONTROL_PROGRAM_ID, Honeycomb, OperationCtx, VAULT } from "@honeycomb-protocol/hive-control";
import { createCreateGuildKitInstruction, CreateGuildKitArgs as CreateGuildKitArgsChain, PROGRAM_ADDRESS, PROGRAM_ID } from "../generated";
import { getGuildKitPda } from "../pdas";

type CreateCreateGuildKitCtx = {
    args: CreateGuildKitArgsChain,
    project: web3.PublicKey,
    authority: web3.PublicKey,
    payer: web3.PublicKey,
    delegateAuthority?: web3.PublicKey,
    programId?: web3.PublicKey,
}
export function createGuildKitCtx(args: CreateCreateGuildKitCtx): OperationCtx & { kitId: web3.PublicKey } {

    const programId = args.programId || new web3.PublicKey(PROGRAM_ADDRESS);;
    const kitKey = web3.Keypair.generate().publicKey;

    // PDAS
    const [guildKit] = getGuildKitPda(programId, args.project, kitKey);

    const instructions: web3.TransactionInstruction[] = [
        createCreateGuildKitInstruction({
            kitKey,
            guildKit,
            project: args.project,
            authority: args.authority,
            payer: args.payer,
            delegateAuthority: args.delegateAuthority || PROGRAM_ID,
            vault: VAULT,
            hiveControl: HIVECONTROL_PROGRAM_ID,
            rentSysvar: web3.SYSVAR_RENT_PUBKEY
        }, {
            args: args.args,
        })
    ]

    return {
        ...createCtx(instructions),
        kitId: guildKit,
    };
}

export type createGuildKitArgs = {
    args: CreateGuildKitArgsChain
    programId: web3.PublicKey,
}
export async function createGuildKit(honeycomb: Honeycomb, args: createGuildKitArgs) {
    const ctx = createGuildKitCtx({
        args: args.args,
        project: honeycomb.project().projectAddress,
        authority: honeycomb.identity().publicKey,
        payer: honeycomb.identity().publicKey,
        delegateAuthority: honeycomb.identity().delegateAuthority().address,
        programId: args.programId,
    });

    return {
        response: await honeycomb.rpc().sendAndConfirmTransaction(ctx, {
            skipPreflight: true,
        }),
        guildKitAddress: ctx.kitId,
    };
}