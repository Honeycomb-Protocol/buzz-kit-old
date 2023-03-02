import * as web3 from "@solana/web3.js"
import { getInvitationPda } from "../pdas";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { AddressContainerRole, createCtx, getAddressContainerPda, Honeycomb, OperationCtx, VAULT } from "@honeycomb-protocol/hive-control";
import { createCreateInvitationInstruction, PROGRAM_ID, CreateInvitationArgs as CreateInvitationArgsChain } from "../generated";

type CreateCreateInvitationCtx = {
    args: CreateInvitationArgsChain,
    project: web3.PublicKey,
    guild: web3.PublicKey,
    member: web3.PublicKey,
    memberNftMint: web3.PublicKey,
    chief: web3.PublicKey,
    chiefNftMint: web3.PublicKey,
    payer: web3.PublicKey,
    authority: web3.PublicKey,
    programId?: web3.PublicKey,
}
export function createInvitationCtx(args: CreateCreateInvitationCtx): OperationCtx & { invitation: web3.PublicKey } {

    const programId = args.programId || PROGRAM_ID;
    const invitationId = web3.Keypair.generate().publicKey;

    // PDAS
    const [invitation] = getInvitationPda(programId);

    // CHIEF
    const [chiefAddressContainer] = getAddressContainerPda(AddressContainerRole.ProjectMints, args.project, args.args.chiefRefrence.addressContainerIndex);
    const chiefAccount = getAssociatedTokenAddressSync(
        args.chiefNftMint,
        args.authority,
    );

    // MEMBER
    const [memberAddressContainer] = getAddressContainerPda(AddressContainerRole.ProjectMints, args.project, args.args.newMemberRefrence.addressContainerIndex);
    const memberAccount = getAssociatedTokenAddressSync(
        args.memberNftMint,
        args.member,
    )

    const instructions: web3.TransactionInstruction[] = [
        createCreateInvitationInstruction({
            invitationId,
            guild: args.guild,
            invitation,
            project: args.project,
            memberAddressContainer,
            memberAccount,
            chiefAccount,
            chief: args.chief,
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
        invitation: invitationId,
    };
}

type CreateInvitationArgs = {
    args: CreateInvitationArgsChain,
    guild: web3.PublicKey,
    member: web3.PublicKey,
    memberNftMint: web3.PublicKey,
    chief: web3.PublicKey,
    chiefNftMint: web3.PublicKey,
    programId?: web3.PublicKey,
}
export async function createInvitation(honeycomb: Honeycomb, args: CreateInvitationArgs) {
    const ctx = createInvitationCtx({
        ...args,
        payer: honeycomb.identity().publicKey,
        authority: honeycomb.identity().publicKey,
        project: honeycomb.projectAddress,
    });

    return {
        response: honeycomb.rpc().sendAndConfirmTransaction(ctx, {
            skipPreflight: true,
        }),
        invitationAddress: ctx.invitation,
    };
}