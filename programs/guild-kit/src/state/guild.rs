use crate::state::enums::*;
use anchor_lang::prelude::*;
use hpl_hive_control::state::IndexedReference;

#[account]
pub struct Guild {
    /// the unique identifier for this guild
    pub guild_id: Pubkey,

    /// bump of seeds
    pub bump: u8,

    /// the key to identify which project does it belong to
    pub guild_kit: Pubkey,

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
    pub const LEN: usize = 120 + 8;

    pub fn set_defaults(&mut self) {
        self.guild_id = Pubkey::default();
        self.bump = 0;
        self.guild_kit = Pubkey::default();
        self.name = "".to_string();
        self.members = vec![];
        self.visibility = GuildVisibility::Public;
        self.joining_criteria = JoiningCriteria::Requested;
    }
}

#[account]
pub struct MembershipLock {
    /// the unique identifier for this guild
    pub guild: Pubkey,

    // member reference
    pub member_reference: IndexedReference,
}
impl MembershipLock {
    pub const LEN: usize = 34 + 8;

    pub fn set_defaults(&mut self) {
        self.guild = Pubkey::default();
        self.member_reference = IndexedReference::default();
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Member {
    pub role: MemberRole,
    pub reference: IndexedReference,
}
