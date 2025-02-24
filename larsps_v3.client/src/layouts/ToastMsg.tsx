import { useEffect } from "react";
import "../assets/scss/ToastMsg.css";
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
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
            <Toast isOpen={isOpen} fade={true} timeout={timeout} className={`modern-toast ${type === "success" ? "success" : "error"}`} >
                <ToastHeader className="toast-header-custom" toggle={toggle}>
                    {type === "success" ? "✅ Success" : "❌ Error"}
                </ToastHeader>
                <ToastBody>{message}</ToastBody>
            </Toast>
        </div>
    );
};

export default ToastMsg;