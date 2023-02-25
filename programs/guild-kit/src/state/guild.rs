use crate::state::enums::*;
use anchor_lang::prelude::*;

#[account]
pub struct Guild {
    /// the unique identifier for this guild
    pub guild_id: Pubkey,

    /// bump of seeds
    pub bump: u8,

    /// the key to identify which project does it belong to
    pub project: Pubkey,

    /// the name of the guild
    pub name: String,

    /// the members who are part of the guild
    pub members: Vec<Member>,

    /// the visibility of the guild
    pub visibility: GuildVisibility,

    /// the criteria for joining the guild
    pub joining_criteria: JoiningCriteria,
}
impl Guild {
    pub const LEN: usize = 32 + 32 + 32 + 24 + 8;

    pub fn set_defaults(&mut self) {
        self.guild_id = Pubkey::default();
        self.bump = 0;
        self.project = Pubkey::default();
        self.name = "".to_string();
        self.members = vec![];
        self.visibility = GuildVisibility::Public;
        self.joining_criteria = JoiningCriteria::Requested;
    }
}

#[account]
pub struct MembershipLock {
    pub locked: bool,
}
impl MembershipLock {
    pub const LEN: usize = 1 + 8;

    pub fn set_defaults(&mut self) {
        self.locked = true;
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Member {
    pub role: MemberRole,
    pub reference: IndexedReference,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug, Default)]
pub struct IndexedReference {
    pub address_container_index: u8,
    pub index_in_container: u8,
}
