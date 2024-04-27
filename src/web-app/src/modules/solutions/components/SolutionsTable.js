import {Button, Table} from "flowbite-react";
import {Link} from "react-router-dom";
import domains from "../Domains.json";
import React from "react";

const SolutionsTable = ({solutions}) => <Table>
    <Table.Head>
        <Table.HeadCell>Solution name</Table.HeadCell>
        <Table.HeadCell>Description</Table.HeadCell>
        <Table.HeadCell>Domain</Table.HeadCell>
        <Table.HeadCell>
            <span className="sr-only">Edit</span>
        </Table.HeadCell>
    </Table.Head>
    <Table.Body className="divide-y">
        {solutions?.map((solution, index) => (
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800" key={index}>
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    <Link to={"/solutions/" + solution.id + "/projects"}> {solution.name} </Link></Table.Cell>
                <Table.Cell>{solution.description}</Table.Cell>
                <Table.Cell>{domains.find(d => d.id == solution.domain).name}</Table.Cell>
                <Table.Cell>
                    <div className="flex flex-wrap gap-2">
                        <Button color="blue">Edit</Button>
                    </div>
                </Table.Cell>
            </Table.Row>
        ))}
    </Table.Body>
</Table>

export {SolutionsTable}