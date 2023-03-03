import * as web3 from "@solana/web3.js"
import { getMembershipLockPda } from "../pdas";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { createAcceptInvitationInstruction, AcceptInvitationArgs as AcceptInvitationArgsChain, PROGRAM_ID } from "../generated";
import { AddressContainerRole, createCtx, getAddressContainerPda, Honeycomb, OperationCtx, VAULT } from "@honeycomb-protocol/hive-control";

type CreateAcceptInvitationCtx = {
    args: AcceptInvitationArgsChain,
    project: web3.PublicKey,
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

    // MEMBER
    const [membershipLock] = getMembershipLockPda(programId, args.project, args.memberNftMint);
    const [memberAddressContainer] = getAddressContainerPda(AddressContainerRole.ProjectMints, args.project, args.args.newMemberRefrence.addressContainerIndex);
    const memberAccount = getAssociatedTokenAddressSync(
        args.memberNftMint,
        args.authority
    )



    const instructions: web3.TransactionInstruction[] = [
        createAcceptInvitationInstruction({
            guild: args.guild,
            project: args.project,
            invitation: args.invitation,
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

export type AcceptInvitationArgs = {
    args: AcceptInvitationArgsChain,
    guild: web3.PublicKey,
    invitation: web3.PublicKey,
    memberNftMint: web3.PublicKey,
    member: web3.PublicKey,
    chief: web3.PublicKey,
    programId?: web3.PublicKey,
}
export async function acceptInvitation(honeycomb: Honeycomb, args: AcceptInvitationArgs) {
    const ctx = createAcceptInvitationCtx({
        ...args,
        project: honeycomb.projectAddress,
        payer: honeycomb.identity().publicKey,
        authority: honeycomb.identity().publicKey,
    });

    return {
        response: await honeycomb.rpc().sendAndConfirmTransaction(ctx, {
            skipPreflight: true,
        }),
    };
}