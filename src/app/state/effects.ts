import { Injectable } from "@angular/core";
import {concatMap, map, of, switchMap, withLatestFrom} from 'rxjs';
import {Actions, createEffect, ofType } from '@ngrx/effects';

import { State } from './';
import * as actions from './actions';
import { ContactService } from "../services/contact.service";
import { Contact } from "../models/contact.model";
import { selectContactList } from './selectors';
import { Store } from "@ngrx/store";


@Injectable()
export class ContactEffects {

    constructor(
        private actions$: Actions,
        private contactService: ContactService,
        private store: Store<State>  
    ){}

    retrieveContactList$ = createEffect(()=> this.actions$.pipe(
        ofType(actions.appStarted),
        concatMap(() => 
            this.contactService.getContactList$().pipe(
                map(contactList => actions.contactListReturned({contactList}))
            )
        )
    ))

    launchEditDialog$ = createEffect(() => this.actions$.pipe(
        ofType(actions.editContactClicked, actions.addContactClicked),
        withLatestFrom(this.store.select(selectContactList)), 
        switchMap(([action, contactList]) => {
            if (action.type === actions.addContactClicked.type) {
                let maxId = 0;

                for (let contact of contactList) {
                    if (contact.id > maxId) {
                        maxId = contact.id;
                    }
                }

                const newId = maxId + 1;

                const newContact: Contact = { id: newId, firstName: "", lastName: "", phoneNumber: "", email: "" };
                
                return this.contactService.editContactDialog$(newContact, false).pipe(
                    map(contact => contact ? actions.editContactConfirmed({ contact }) : actions.editContactCancelled())
                );
            } else {
                return this.contactService.editContactDialog$(action.contact, true).pipe(
                    map(contact => contact ? actions.editContactConfirmed({ contact }) : actions.editContactCancelled())
                );
            }
        })
    ));
    
    saveContact$ = createEffect(()=> this.actions$.pipe(
        ofType(actions.editContactConfirmed),
        concatMap(action =>
            this.contactService.saveContact$(action.contact).pipe(
                map(contact => actions.contactSavedSuccess({contact}))
            )
        )
    ))

    createContact$ = createEffect(()=> this.actions$.pipe(
        ofType(actions.createContact),
        concatMap(action =>
            this.contactService.saveContact$(action.contact).pipe(
                map(contact => actions.contactSavedSuccess({contact}))
            )
        )
    ))

   

}