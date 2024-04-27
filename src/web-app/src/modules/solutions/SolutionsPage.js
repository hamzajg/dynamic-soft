import React, {useContext, useState} from 'react';
import {Button} from 'flowbite-react';
import {SolutionContext} from "./SolutionProvider";
import {SolutionForm, SolutionsTable} from "./components";

const SolutionsPage = () => {
    const [showRightPanel, setShowRightPanel] = useState(false);
    const {solutions} = useContext(SolutionContext);

    const handleAddSolution = () => {
        setShowRightPanel(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Solutions</h1>
                <Button color="blue" onClick={handleAddSolution}>Add Solution</Button>
            </div>

            <SolutionsTable solutions={solutions} />

            <SolutionForm showRightPanel={showRightPanel} setShowRightPanel={setShowRightPanel}/>
        </div>
    );
};

export default SolutionsPage;
