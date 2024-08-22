import { createReducer, on, Action } from "@ngrx/store";
import { Contact } from "../models/contact.model";
import * as actions from "./actions";
import * as _ from 'lodash';

export interface State {
    contactList : Contact[];
    selectedContactId : number | null;
}

const initialState: State = {
    contactList : [],
    selectedContactId : null
}

//#region Helper Functions

function upsertContactList(contactList: Contact[], updatedContact: Contact): Contact[] {
    const index = _.findIndex(contactList, { id: updatedContact.id });
    if (index < 0) {
      return [...contactList, updatedContact];
    }
   
    return [...contactList.slice(0, index), updatedContact, ...contactList.slice(index + 1)];
}

//#endregion

export const reducer = createReducer(
    initialState,
    on(actions.createContact, (state, { contact }) => ({
        ...state,
        contactList: [...state.contactList, contact]
      })),
      
    on(actions.contactListReturned, (state, action) => ({
        ...state,
        contactList : action.contactList
    })),

    on(actions.contactSavedSuccess, (state, action) => ({
        ...state,
        contactList : upsertContactList(state.contactList, action.contact)
    })),

    on(actions.contactSelected, (state, action) => ({
        ...state,
        selectedContactId : action.contactId
    })),

    on(actions.editContactClicked, (state, action) => ({
        ...state,
        selectedContactId : action.contact.id
    }))

)
