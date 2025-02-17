import { Modal, ModalHeader, ModalBody, Spinner } from 'reactstrap';

const LoadingModal = ({ isOpen }: any) => {
    return (
        <Modal isOpen={isOpen} centered>
            <ModalHeader>Processing</ModalHeader>
            <ModalBody className="text-center">
                <Spinner color="primary" />
                <p className="mt-3">Submitting... Please wait.</p>
            </ModalBody>
        </Modal>
    );
};

export default LoadingModal;
