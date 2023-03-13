use {
    anchor_lang::prelude::*,
    hpl_hive_control::state::{AddressContainer, AddressContainerRole},
};

pub fn assetion_project_of_address_container(
    project: Pubkey,
    address_container: &Account<AddressContainer>,
) -> bool {
    return address_container.role == AddressContainerRole::ProjectMints
        && address_container.associated_with == project;
}
