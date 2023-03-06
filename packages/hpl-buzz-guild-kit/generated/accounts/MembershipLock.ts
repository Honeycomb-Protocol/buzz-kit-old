/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import * as beet from '@metaplex-foundation/beet'
import {
  IndexedReference,
  indexedReferenceBeet,
} from '../types/IndexedReference'

/**
 * Arguments used to create {@link MembershipLock}
 * @category Accounts
 * @category generated
 */
export type MembershipLockArgs = {
  guild: web3.PublicKey
  memberReference: IndexedReference
}

export const membershipLockDiscriminator = [30, 222, 85, 175, 67, 133, 40, 43]
/**
 * Holds the data for the {@link MembershipLock} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class MembershipLock implements MembershipLockArgs {
  private constructor(
    readonly guild: web3.PublicKey,
    readonly memberReference: IndexedReference
  ) {}

  /**
   * Creates a {@link MembershipLock} instance from the provided args.
   */
  static fromArgs(args: MembershipLockArgs) {
    return new MembershipLock(args.guild, args.memberReference)
  }

  /**
   * Deserializes the {@link MembershipLock} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [MembershipLock, number] {
    return MembershipLock.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link MembershipLock} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<MembershipLock> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find MembershipLock account at ${address}`)
    }
    return MembershipLock.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      '38foo9CSfPiPZTBvNhouNaYpvkzKEzWW396PUW2GKPVA'
    )
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, membershipLockBeet)
  }

  /**
   * Deserializes the {@link MembershipLock} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [MembershipLock, number] {
    return membershipLockBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link MembershipLock} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return membershipLockBeet.serialize({
      accountDiscriminator: membershipLockDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link MembershipLock}
   */
  static get byteSize() {
    return membershipLockBeet.byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link MembershipLock} data from rent
   *
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      MembershipLock.byteSize,
      commitment
    )
  }

  /**
   * Determines if the provided {@link Buffer} has the correct byte size to
   * hold {@link MembershipLock} data.
   */
  static hasCorrectByteSize(buf: Buffer, offset = 0) {
    return buf.byteLength - offset === MembershipLock.byteSize
  }

  /**
   * Returns a readable version of {@link MembershipLock} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      guild: this.guild.toBase58(),
      memberReference: this.memberReference,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const membershipLockBeet = new beet.BeetStruct<
  MembershipLock,
  MembershipLockArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['guild', beetSolana.publicKey],
    ['memberReference', indexedReferenceBeet],
  ],
  MembershipLock.fromArgs,
  'MembershipLock'
)
