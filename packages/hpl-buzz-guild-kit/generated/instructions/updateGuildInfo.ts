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
  UpdateGuildNameArgs,
  updateGuildNameArgsBeet,
} from '../types/UpdateGuildNameArgs'

/**
 * @category Instructions
 * @category UpdateGuildInfo
 * @category generated
 */
export type UpdateGuildInfoInstructionArgs = {
  args: UpdateGuildNameArgs
}
/**
 * @category Instructions
 * @category UpdateGuildInfo
 * @category generated
 */
export const updateGuildInfoStruct = new beet.FixableBeetArgsStruct<
  UpdateGuildInfoInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', updateGuildNameArgsBeet],
  ],
  'UpdateGuildInfoInstructionArgs'
)
/**
 * Accounts required by the _updateGuildInfo_ instruction
 *
 * @property [] guildKit
 * @property [_writable_] guild
 * @property [] project
 * @property [] addressContainer
 * @property [] chiefAccount
 * @property [_writable_, **signer**] payer
 * @property [_writable_, **signer**] authority
 * @property [_writable_] vault
 * @category Instructions
 * @category UpdateGuildInfo
 * @category generated
 */
export type UpdateGuildInfoInstructionAccounts = {
  guildKit: web3.PublicKey
  guild: web3.PublicKey
  project: web3.PublicKey
  addressContainer: web3.PublicKey
  chiefAccount: web3.PublicKey
  tokenProgram?: web3.PublicKey
  payer: web3.PublicKey
  authority: web3.PublicKey
  vault: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const updateGuildInfoInstructionDiscriminator = [
  19, 221, 94, 133, 253, 215, 212, 62,
]

/**
 * Creates a _UpdateGuildInfo_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category UpdateGuildInfo
 * @category generated
 */
export function createUpdateGuildInfoInstruction(
  accounts: UpdateGuildInfoInstructionAccounts,
  args: UpdateGuildInfoInstructionArgs,
  programId = new web3.PublicKey('38foo9CSfPiPZTBvNhouNaYpvkzKEzWW396PUW2GKPVA')
) {
  const [data] = updateGuildInfoStruct.serialize({
    instructionDiscriminator: updateGuildInfoInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.guildKit,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.guild,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.project,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.addressContainer,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.chiefAccount,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
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
