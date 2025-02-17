import { useEffect } from "react";
import { Toast, ToastHeader, ToastBody } from "reactstrap";

interface ToastMsgProps {
    isOpen: boolean;
    type: "success" | "error";
    message: string;
    toggle: () => void;
    timeout?: number;
}

const ToastMsg = ({ isOpen, type, message, toggle, timeout = 3000 }: ToastMsgProps) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                toggle();
            }, timeout);

            return () => clearTimeout(timer);
        }
    }, [isOpen, timeout, toggle]);

    return (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
            <Toast isOpen={isOpen} fade={true} timeout={timeout}>
                <ToastHeader icon={type === "success" ? "success" : "danger"} toggle={toggle}>
                    {type === "success" ? "Success" : "Error"}
                </ToastHeader>
                <ToastBody>{message}</ToastBody>
            </Toast>
        </div>
    );
};

export default ToastMsg;