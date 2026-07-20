import React, { createContext, useState } from "react";

export interface OverlayContextType {
    status: boolean;
    statusSideBarMobile: boolean;
    statusDialogForm: boolean;
    changeStatus: (value: boolean) => void;
    changeStatusSideBarMobile: (value: boolean) => void;
    changeStatusDialogForm: (value: boolean) => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export const OverlayProvider = ({children}:{children:React.ReactNode}) => {
    const [status, setStatus] = useState<boolean>(false);
    const [statusSideBarMobile, setStatusSideBarMobile] = useState<boolean>(false);
    const [statusDialogForm, setStatusDialogForm] = useState<boolean>(false);

    const changeStatus = (value: boolean) => {
        setStatus(value);
    }

    const changeStatusSideBarMobile = (value: boolean) => {
        setStatusSideBarMobile(value);
    }

    const changeStatusDialogForm = (value: boolean) => {
        setStatusDialogForm(value);
    }

    return (
        <OverlayContext.Provider value={{status, statusSideBarMobile, statusDialogForm, changeStatus, changeStatusSideBarMobile, changeStatusDialogForm}}>
            {children}
        </OverlayContext.Provider>
    );
}

export const useOverlay = () => {
    const context = React.useContext(OverlayContext);
	if (context === undefined) {
		throw new Error('useOverlay must be used within a OverlayProvider')
	}
	return context
}

