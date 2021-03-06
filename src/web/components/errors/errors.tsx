import * as React from "react";
import { Modal, Button, Icon, Header } from "semantic-ui-react";
import { observer } from "mobx-react";
import { inject, external } from "tsdi";

import { ErrorStore } from "../../store";

@observer @external
export class Errors extends React.Component {
    @inject private errors: ErrorStore;

    public render() {
        const { latestError, dismiss } = this.errors;
        if (!latestError) {
            return null;
        }
        return (
            <Modal onClose={dismiss} open size="small">
                <Header
                    icon="warning sign"
                    content="An error occured"
                />
                <Modal.Content>
                    {latestError.message}
                </Modal.Content>
                <Modal.Actions>
                    {
                        latestError.fatal ? (
                            <Button color="red" invert onClick={() => window.location.href = "/"}>
                                <Icon name="remove" /> Reload Page
                            </Button>
                        ) : (
                            <Button color="red" invert onClick={this.errors.dismiss}>
                                <Icon name="remove" /> OK
                            </Button>
                        )
                    }
                </Modal.Actions>
            </Modal>
        );
    }
}
