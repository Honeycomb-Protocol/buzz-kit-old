import * as web3 from "@solana/web3.js"
import { getInvitationPda } from "../pdas";
import { AddressContainerRole, createCtx, getAddressContainerPda, Honeycomb, OperationCtx, VAULT } from "@honeycomb-protocol/hive-control";
import { PROGRAM_ID, SendInvitationArgs as SendInvitationArgsChain, createSendInvitationInstruction } from "../generated";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

type CreateSendInvitationCtx = {
    args: SendInvitationArgsChain,
    project: web3.PublicKey,
    guild: web3.PublicKey,
    guild_kit: web3.PublicKey,
    memberNftMint: web3.PublicKey,
    chiefNftMint: web3.PublicKey,
    payer: web3.PublicKey,
    authority: web3.PublicKey,
    programId?: web3.PublicKey,
}
export function sendInvitationCtx(args: CreateSendInvitationCtx): OperationCtx & { invitation: web3.PublicKey } {

    const programId = args.programId || PROGRAM_ID;
    const invitationId = web3.Keypair.generate().publicKey;

    // PDAS
    const [invitation] = getInvitationPda(programId, args.guild, invitationId);

    // CHIEF
    const [chiefAddressContainer] = getAddressContainerPda(AddressContainerRole.ProjectMints, args.project, args.args.chiefRefrence.addressContainerIndex);
    const chiefAccount = getAssociatedTokenAddressSync(
        args.chiefNftMint,
        args.authority,
    );

    const instructions: web3.TransactionInstruction[] = [
        createSendInvitationInstruction({
            invitationId,
            guild: args.guild,
            guildKit: args.guild_kit,
            invitation,
            invitingMint: args.memberNftMint,
            invitedBy: chiefAccount,
            chiefAddressContainer,
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
        invitation: invitation,
    };
}

export type sendInvitationArgs = {
    args: SendInvitationArgsChain,
    guild: web3.PublicKey,
    member: web3.PublicKey,
    memberNftMint: web3.PublicKey,
    chiefNftMint: web3.PublicKey,
    programId?: web3.PublicKey,
}
export async function sendInvitation(honeycomb: Honeycomb, args: sendInvitationArgs) {
    const ctx = sendInvitationCtx({
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
        invitationAddress: ctx.invitation,
    };
}