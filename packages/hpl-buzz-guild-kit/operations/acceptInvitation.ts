import * as web3 from "@solana/web3.js"
import { getInvitationPda, getMembershipLockPda } from "../pdas";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { createAcceptInvitationInstruction, AcceptInvitationArgs as AcceptInvitationArgsChain, PROGRAM_ID } from "../generated";
import { AddressContainerRole, createCtx, getAddressContainerPda, Honeycomb, OperationCtx, VAULT } from "@honeycomb-protocol/hive-control";

type CreateAcceptInvitationCtx = {
    args: AcceptInvitationArgsChain,
    project: web3.PublicKey,
    guild_kit: web3.PublicKey,
    guild: web3.PublicKey,
    payer: web3.PublicKey,
    authority: web3.PublicKey,
    invitation: web3.PublicKey,
    memberNftMint: web3.PublicKey,
    member: web3.PublicKey,
    chief: web3.PublicKey,
    programId?: web3.PublicKey,
}
export function createAcceptInvitationCtx(args: CreateAcceptInvitationCtx): OperationCtx {

    const programId = args.programId || PROGRAM_ID;
    const [invitation] = getInvitationPda(programId, args.guild, args.invitation);
    const [membershipLock] = getMembershipLockPda(programId, args.guild, args.memberNftMint);
    const [memberAddressContainer] = getAddressContainerPda(AddressContainerRole.ProjectMints, args.project, args.args.newMemberRefrence.addressContainerIndex);
    const memberAccount = getAssociatedTokenAddressSync(
        args.memberNftMint,
        args.authority
    )



    const instructions: web3.TransactionInstruction[] = [
        createAcceptInvitationInstruction({
            project: args.project,
            guild: args.guild,
            guildKit: args.guild_kit,
            invitation,
            memberAddressContainer,
            memberAccount,
            membershipLock,
            chief: args.chief,
            payer: args.payer,
            authority: args.authority,
            vault: VAULT,
        }, {
            args: args.args
        })
    ]

    return {
        ...createCtx(instructions),
    };
}

export type acceptInvitationArgs = {
    args: AcceptInvitationArgsChain,
    guild: web3.PublicKey,
    invitation: web3.PublicKey,
    memberNftMint: web3.PublicKey,
    member: web3.PublicKey,
    chief: web3.PublicKey,
    programId?: web3.PublicKey,
}
export async function acceptInvitation(honeycomb: Honeycomb, args: acceptInvitationArgs) {
    const ctx = createAcceptInvitationCtx({
        ...args,
        project: honeycomb.project().projectAddress,
        payer: honeycomb.identity().publicKey,
        authority: honeycomb.identity().publicKey,
        guild_kit: honeycomb.guildKit().guildKitAddress,
    });

    return {
        response: await honeycomb.rpc().sendAndConfirmTransaction(ctx, {
            skipPreflight: true,
        }),
    };
}