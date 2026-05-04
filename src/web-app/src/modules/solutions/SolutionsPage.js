import React, {useContext, useState} from 'react';
import {SolutionContext} from "./SolutionProvider";
import {SolutionForm, SolutionsTable} from "./components";
import {PageHeader, ContentCard} from "../../ui/Shared";

const SolutionsPage = () => {
    const [showRightPanel, setShowRightPanel] = useState(false);
    const {solutions} = useContext(SolutionContext);

    return (
        <div className="animate-fade-in">
            <PageHeader 
                title="SOLUTIONS" 
                subtitle="Manage your domain-specific business solutions." 
                actionLabel="+ NEW SOLUTION" 
                onAction={() => setShowRightPanel(true)} 
            />

            <ContentCard noPadding={true}>
                <SolutionsTable solutions={solutions} />
            </ContentCard>

            <SolutionForm showRightPanel={showRightPanel} setShowRightPanel={setShowRightPanel}/>
        </div>
    );
};

export default SolutionsPage;
