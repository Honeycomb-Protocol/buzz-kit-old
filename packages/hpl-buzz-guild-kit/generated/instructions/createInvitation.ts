/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import {
  CreateInvitationArgs,
  createInvitationArgsBeet,
} from '../types/CreateInvitationArgs'

/**
 * @category Instructions
 * @category CreateInvitation
 * @category generated
 */
export type CreateInvitationInstructionArgs = {
  args: CreateInvitationArgs
}
/**
 * @category Instructions
 * @category CreateInvitation
 * @category generated
 */
export const createInvitationStruct = new beet.BeetArgsStruct<
  CreateInvitationInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', createInvitationArgsBeet],
  ],
  'CreateInvitationInstructionArgs'
)
/**
 * Accounts required by the _createInvitation_ instruction
 *
 * @property [] invitationId
 * @property [_writable_] guild
 * @property [_writable_] invitation
 * @property [_writable_] project
 * @property [] chiefAddressContainer
 * @property [] chiefAccount
 * @property [_writable_] chief
 * @property [] memberAddressContainer
 * @property [_writable_] memberAccount
 * @property [_writable_, **signer**] payer
 * @property [_writable_, **signer**] authority
 * @property [_writable_] vault
 * @category Instructions
 * @category CreateInvitation
 * @category generated
 */
export type CreateInvitationInstructionAccounts = {
  invitationId: web3.PublicKey
  guild: web3.PublicKey
  invitation: web3.PublicKey
  project: web3.PublicKey
  chiefAddressContainer: web3.PublicKey
  chiefAccount: web3.PublicKey
  chief: web3.PublicKey
  memberAddressContainer: web3.PublicKey
  memberAccount: web3.PublicKey
  payer: web3.PublicKey
  authority: web3.PublicKey
  vault: web3.PublicKey
  rent?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const createInvitationInstructionDiscriminator = [
  52, 19, 21, 13, 54, 156, 27, 172,
]

/**
 * Creates a _CreateInvitation_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category CreateInvitation
 * @category generated
 */
export function createCreateInvitationInstruction(
  accounts: CreateInvitationInstructionAccounts,
  args: CreateInvitationInstructionArgs,
  programId = new web3.PublicKey('38foo9CSfPiPZTBvNhouNaYpvkzKEzWW396PUW2GKPVA')
) {
  const [data] = createInvitationStruct.serialize({
    instructionDiscriminator: createInvitationInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.invitationId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.guild,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.invitation,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.project,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.chiefAddressContainer,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.chiefAccount,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.chief,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.memberAddressContainer,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.memberAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.payer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.authority,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.vault,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.rent ?? web3.SYSVAR_RENT_PUBKEY,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}