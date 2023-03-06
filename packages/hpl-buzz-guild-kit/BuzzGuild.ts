import { PublicKey } from "@solana/web3.js";
import { BuzzGuildKit } from "./BuzzGuildKit";
import {
    Guild,
    GuildVisibility,
    IndexedReference,
    Invitation,
    JoiningCriteria,
    Member,
    Request
} from "./generated";
import {
    acceptInvitation,
    acceptInvitationArgs,
    acceptRequest,
    acceptRequestArgs,
    createInvitation,
    createInvitationArgs,
    createRequest,
    createRequestArgs,
    joinGuild,
    joinGuildArgs,
    updateGuild,
    updateGuildInfoArgs,
    updateMemberRole,
    updateMemberRoleCtx,
} from "./operations";

export class BuzzGuild {
    public readonly guildId: PublicKey
    public readonly bump: number
    public readonly name: string
    public readonly members: Member[]
    public readonly visibility: GuildVisibility
    public readonly joiningCriteria: JoiningCriteria

    constructor(private _guildKit: BuzzGuildKit, readonly guildAddress: PublicKey, private _guild: Guild) {
        this.guildId = _guild.guildId;
        this.bump = _guild.bump;
        this.name = _guild.name;
        this.members = _guild.members;
        this.visibility = _guild.visibility;
        this.joiningCriteria = _guild.joiningCriteria;
    }

    public guildKit() {
        return this._guildKit;
    }

    public guild() {
        return this._guild;
    }

    public updateInfo(args: updateGuildInfoArgs) {
        return updateGuild(this._guildKit.honeycomb(), {
            ...args,
            programId: this._guildKit.programId,
        })
    }

    public updateRoles(args: updateMemberRoleCtx) {
        return updateMemberRole(this._guildKit.honeycomb(), {
            ...args,
            programId: this._guildKit.programId,
        })
    }

    public createInvitation(args: createInvitationArgs) {
        return createInvitation(this._guildKit.honeycomb(), {
            ...args,
            programId: this._guildKit.programId,
        });
    }

    public acceptInvitation(args: acceptInvitationArgs) {
        return acceptInvitation(this._guildKit.honeycomb(), {
            ...args,
            programId: this._guildKit.programId,
        });
    }

    public createRequest(args: createRequestArgs) {
        return createRequest(this._guildKit.honeycomb(), {
            ...args,
            programId: this._guildKit.programId,
        });
    }

    public acceptRequest(args: acceptRequestArgs) {
        return acceptRequest(this._guildKit.honeycomb(), {
            ...args,
            programId: this._guildKit.programId,
        });
    }

    public joinGuild(args: joinGuildArgs) {
        return joinGuild(this._guildKit.honeycomb(), {
            ...args,
            programId: this._guildKit.programId,
        });
    }

}

export class BuzzGuildFetch {
    constructor(private _guildKit: BuzzGuildKit, private _guild: BuzzGuild) { }

    public invitation(address: PublicKey) {
        return Invitation.fromAccountAddress(this._guildKit.honeycomb().connection, address)
    }

    public allInvitations() {
        return Invitation.gpaBuilder()
            .addFilter("guild", this._guild.guildAddress)
            .run(this._guildKit.honeycomb().connection)
    }
    public myInvitations(member: IndexedReference) {
        return Invitation.gpaBuilder()
            .addFilter("invited", member)
    }

    public request(address: PublicKey) {
        return Request.fromAccountAddress(this._guildKit.honeycomb().connection, address)
    }

    public allRequests() {
        return Request.gpaBuilder()
            .addFilter("guild", this._guild.guildAddress)
            .run(this._guildKit.honeycomb().connection)
    }


}