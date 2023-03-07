import * as web3 from "@solana/web3.js"
import { getRequestPda } from "../pdas";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { AddressContainerRole, createCtx, getAddressContainerPda, Honeycomb, OperationCtx, VAULT } from "@honeycomb-protocol/hive-control";
import { createCreateRequestInstruction, PROGRAM_ID, CreateRequestArgs as CreateRequestArgsChain } from "../generated";

type CreateCreateRequestCtx = {
    args: CreateRequestArgsChain,
    project: web3.PublicKey,
    guild: web3.PublicKey,
    guild_kit: web3.PublicKey,
    memberNftMint: web3.PublicKey,
    payer: web3.PublicKey,
    authority: web3.PublicKey,
    programId?: web3.PublicKey,
}
export function createRequestCtx(args: CreateCreateRequestCtx): OperationCtx & { request: web3.PublicKey } {

    const programId = args.programId || PROGRAM_ID;
    const requestId = web3.Keypair.generate().publicKey;

    // PDAS
    const [request] = getRequestPda(programId, args.guild, requestId);
    const [memberAddressContainer] = getAddressContainerPda(AddressContainerRole.ProjectMints, args.project, args.args.newMemberRefrence.addressContainerIndex);
    const memberAccount = getAssociatedTokenAddressSync(
        args.memberNftMint,
        args.authority,
    )

    const instructions: web3.TransactionInstruction[] = [
        createCreateRequestInstruction({
            requestId,
            guild: args.guild,
            guildKit: args.guild_kit,
            request,
            memberAddressContainer,
            memberAccount,
            member: args.authority,
            payer: args.payer,
            authority: args.authority,
            rent: web3.SYSVAR_RENT_PUBKEY,
            vault: VAULT,
        }, {
            args: args.args
        })
    ]

    return {
        ...createCtx(instructions),
        request: request,
    };
}

export type createRequestArgs = {
    args: CreateRequestArgsChain,
    guild: web3.PublicKey,
    memberNftMint: web3.PublicKey,
    programId?: web3.PublicKey,
}
export async function createRequest(honeycomb: Honeycomb, args: createRequestArgs) {
    const ctx = createRequestCtx({
        ...args,
        payer: honeycomb.identity().publicKey,
        authority: honeycomb.identity().publicKey,
        project: honeycomb.project().projectAddress,
        guild_kit: honeycomb.guildKit().guildKitAddress,
    });

    return {
        response: await honeycomb.rpc().sendAndConfirmTransaction(ctx, {
            skipPreflight: true,
        }),
        requestAddress: ctx.request,
    };
}