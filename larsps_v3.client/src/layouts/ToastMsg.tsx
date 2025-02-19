import { useEffect } from "react";
import { Toast, ToastHeader, ToastBody } from "reactstrap";

interface ToastMsgProps {
    isOpen: boolean;
    type: "success" | "error";
    message: string;
    toggle: () => void;
    timeout?: number;  // Optional prop
}

const ToastMsg = ({ isOpen, type, message, toggle, timeout }: ToastMsgProps) => {
    const finalTimeout = timeout ?? 3000;  // Ensure timeout is never undefined

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                toggle();
            }, finalTimeout);

            return () => clearTimeout(timer);
        }
    }, [isOpen, finalTimeout, toggle]);

    return (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
            <Toast isOpen={isOpen} timeout={finalTimeout}>
                <ToastHeader icon={type === "success" ? "success" : "danger"} toggle={toggle}>
                    {type === "success" ? "Success" : "Error"}
                </ToastHeader>
                <ToastBody>{message}</ToastBody>
            </Toast>
        </div>
    );
};

export default ToastMsg;
