import {Button, Table} from "flowbite-react";
import {Link} from "react-router-dom";
import React from "react";

const DiagramsTable = ({projectDiagrams}) =><Table hoverable>
    <Table.Head>
        <Table.HeadCell>Diagram name</Table.HeadCell>
        <Table.HeadCell>Description</Table.HeadCell>
        <Table.HeadCell>Type</Table.HeadCell>
        <Table.HeadCell>Created At</Table.HeadCell>
        <Table.HeadCell>Updated At</Table.HeadCell>
        <Table.HeadCell>
            <span className="sr-only">Board</span>
            <span className="sr-only">Edit</span>
            <span className="sr-only">Remove</span>
        </Table.HeadCell>
    </Table.Head>
    <Table.Body className="divide-y">
        {projectDiagrams.map((diagram, index) => (
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800" key={index}>
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {diagram.name}</Table.Cell>
                <Table.Cell>{diagram.description}</Table.Cell>
                <Table.Cell>{diagram.type}</Table.Cell>
                <Table.Cell>{diagram.createdAt}</Table.Cell>
                <Table.Cell>{diagram.updatedAt}</Table.Cell>
                <Table.Cell>
                    <div className="flex flex-wrap gap-2">
                        <Button color="green"><Link
                            to={"/projects/" + diagram.projectId + "/diagrams/" + diagram.id + "/board"}>Board</Link></Button>
                        <Button color="blue">Edit</Button>
                        <Button color="red">Remove</Button>
                    </div>
                </Table.Cell>
            </Table.Row>
        ))}

    </Table.Body>
</Table>

export {DiagramsTable};