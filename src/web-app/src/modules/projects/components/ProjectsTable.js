import {Button, Table} from "flowbite-react";
import {Link} from "react-router-dom";
import React from "react";

const ProjectsTable = ({projects}) => <Table>
    <Table.Head>
        <Table.HeadCell>Project name</Table.HeadCell>
        <Table.HeadCell>Description</Table.HeadCell>
        <Table.HeadCell>Tags</Table.HeadCell>
        <Table.HeadCell>Teams</Table.HeadCell>
        <Table.HeadCell>
            <span className="sr-only">Edit</span>
            <span className="sr-only">Remove</span>
        </Table.HeadCell>
    </Table.Head>
    <Table.Body className="divide-y">
        {projects.map((project, index) => (
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800" key={index}>
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    <Link to={"/projects/" + project.id + "/diagrams"}> {project.name} </Link></Table.Cell>
                <Table.Cell>{project.description}</Table.Cell>
                <Table.Cell>{project.tags.map(item => item.name + ", ")}</Table.Cell>
                <Table.Cell>{project.teamMembers.map(item => item.name + ", ")}</Table.Cell>
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

export {ProjectsTable};