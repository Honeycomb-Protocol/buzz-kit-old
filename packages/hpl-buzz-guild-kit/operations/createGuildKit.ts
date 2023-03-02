import * as web3 from "@solana/web3.js"
import { createCtx, HIVECONTROL_PROGRAM_ID, Honeycomb, OperationCtx, VAULT } from "@honeycomb-protocol/hive-control";
import { createCreateGuildKitInstruction, PROGRAM_ADDRESS } from "../generated";
import { getGuildKitPda } from "../pdas";

type CreateCreateGuildKitCtx = {
    project: web3.PublicKey,
    authority: web3.PublicKey,
    payer: web3.PublicKey,
    programId?: web3.PublicKey,
}
export function createGuildKitCtx(args: CreateCreateGuildKitCtx): OperationCtx & { kitId: web3.PublicKey } {

    const programId = args.programId || new web3.PublicKey(PROGRAM_ADDRESS);;
    const kitId = web3.Keypair.generate().publicKey;

    // PDAS
    const [guildKit] = getGuildKitPda(programId);

    const instructions: web3.TransactionInstruction[] = [
        createCreateGuildKitInstruction({
            kitId,
            guildKit,
            project: args.project,
            authority: args.authority,
            payer: args.payer,
            vault: VAULT,
            hiveControl: HIVECONTROL_PROGRAM_ID,
            rentSysvar: web3.SYSVAR_RENT_PUBKEY
        })
    ]

    return {
        ...createCtx(instructions),
        kitId: kitId,
    };
}

type CreateGuildKitArgs = {
    programId: web3.PublicKey,
}
export async function createGuildKit(honeycomb: Honeycomb, args: CreateGuildKitArgs) {
    const ctx = createGuildKitCtx({
        project: honeycomb.projectAddress,
        authority: honeycomb.identity().publicKey,
        payer: honeycomb.identity().publicKey,
        programId: args.programId,
    });

    return {
        response: honeycomb.rpc().sendAndConfirmTransaction(ctx, {
            skipPreflight: true,
        }),
        guildKitAddress: ctx.kitId,
    };
}