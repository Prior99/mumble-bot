import * as React from "react";
import { Modal, Button, Icon, Header } from "semantic-ui-react";
import { observer } from "mobx-react";
import { inject, external } from "tsdi";

import { ErrorStore } from "../../../common-ui";

@observer @external
export class Errors extends React.PureComponent<{}> {
    @inject private errors: ErrorStore;

    public render() {
        const { latestError, dismiss } = this.errors;
        if (!latestError) {
            return null;
        }
        return (
            <Modal onClose={dismiss} open basic size="small">
                <Header
                    icon="warning sign"
                    content="An error occured"
                />
                <Modal.Content>
                    {latestError.message}
                </Modal.Content>
                <Modal.Actions>
                    <Button basic color="red" invert onClick={dismiss}>
                        <Icon name="remove" /> Dismiss
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}
