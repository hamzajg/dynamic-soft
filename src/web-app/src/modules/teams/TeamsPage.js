import React, {useContext, useState} from 'react';
import {Button, Table, TextInput, Textarea, Drawer} from 'flowbite-react';
import {TeamContext} from "./TeamsProvider";
import Multiselect from 'multiselect-react-dropdown';

const TeamsPage = () => {
    const [showRightPanel, setShowRightPanel] = useState(false);
    const {addTeam, teams} = useContext(TeamContext);
    const [formData, setFormData] = useState({id: '', name: '', description: '', guild: '', members: []});
    const [options, setOptions] = useState([{name: "Hamza Jguerim", id: 1}, {name: "Joe Doe", id: 2}]);
    const [selectedValues, setSelectedValues] = useState([]);

    const handleAddTeam = () => {
        setShowRightPanel(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        addTeam(formData);
        setFormData({id: '', name: '', description: '', guild: '', members: []});
        setSelectedValues([])
        setShowRightPanel(false);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Teams</h1>
                <Button color="blue" onClick={handleAddTeam}>Add Team</Button>
            </div>

            <Table hoverable>
                <Table.Head>
                    <Table.HeadCell>Team name</Table.HeadCell>
                    <Table.HeadCell>Description</Table.HeadCell>
                    <Table.HeadCell>Tribe/Guild</Table.HeadCell>
                    <Table.HeadCell>Members</Table.HeadCell>
                    <Table.HeadCell>
                        <span className="sr-only">Edit</span>
                        <span className="sr-only">Remove</span>
                    </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                    {teams?.map((team, index) => (
                        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800" key={index}>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                {team.name} </Table.Cell>
                            <Table.Cell>{team.description}</Table.Cell>
                            <Table.Cell>{team.guild}</Table.Cell>
                            <Table.Cell>{team.members.map(item => item.name + ", ")}</Table.Cell>
                            <Table.Cell>
                                <div className="flex flex-wrap gap-2">
                                    <Button color="blue">Edit</Button>
                                    <Button color="red">Remove</Button>
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    ))}

                </Table.Body>
            </Table>

            <Drawer open={showRightPanel} onClose={() => setShowRightPanel(false)} position="right">
                <Drawer.Header title="Create Team" />
                <Drawer.Items>
                    <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
                    <div>
                        <div className="mb-2 block">
                            <label htmlFor="teamName" className="text-sm font-medium text-gray-900 dark:text-white">
                                Team Name
                            </label>
                        </div>
                        <TextInput
                            id="teamName"
                            placeholder="Enter team name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required={true}
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <label htmlFor="teamDescription"
                                   className="text-sm font-medium text-gray-900 dark:text-white">
                                Team Description
                            </label>
                        </div>
                        <Textarea
                            id="teamDescription"
                            placeholder="Enter team description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows={3}
                            required={true}
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <label htmlFor="teamGuild" className="text-sm font-medium text-gray-900 dark:text-white">
                                Team Tribe/Guild
                            </label>
                        </div>
                        <TextInput
                            id="teamGuild"
                            placeholder="Enter team tribe or guild name"
                            value={formData.guild}
                            onChange={(e) => setFormData({...formData, guild: e.target.value})}
                            required={true}
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <label htmlFor="teamMembers" className="text-sm font-medium text-gray-900 dark:text-white">
                                Team Members
                            </label>
                        </div>
                        <Multiselect
                            id="teamMembers"
                            options={options.filter(opt => !selectedValues.includes(opt))}
                            displayValue="name"
                            selectedValues={formData.members}
                            onSelect={(list, value) => {
                                setFormData({...formData, members: [...formData.members, value]})
                                setSelectedValues([...selectedValues, value])
                            }}/>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
                        <Button type="submit">Create Team</Button>
                    </div>
                </form>
            </Drawer.Items>
        </Drawer>
        </div>
    );
};

export default TeamsPage;
