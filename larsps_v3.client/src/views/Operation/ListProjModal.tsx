import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import React from 'react';
import ProjectsTable from "./ProjectsTable";

interface ModalExampleProps {
    buttonLabel: string;
    className?: string; // optional prop
    onClose: () => void; // callback to close modal
}

interface ModalExampleState {
    modal: boolean;
}

class ListProjModal extends React.Component<ModalExampleProps, ModalExampleState> {
    constructor(props: ModalExampleProps) {
        super(props);
        this.state = {
            modal: true // Show the modal immediately when the component is rendered
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState((prevState) => ({
            modal: !prevState.modal
        }));

        // If the modal is being closed, call the parent's onClose
        if (this.state.modal && this.props.onClose) {
            this.props.onClose();
        }
    }

    render() {
        return (
            <div>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className} size="xl">
                    <ModalHeader toggle={this.toggle}>Select Project</ModalHeader>
                    <ModalBody>
                        <ProjectsTable closeModal={this.props.onClose} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggle}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default ListProjModal;
