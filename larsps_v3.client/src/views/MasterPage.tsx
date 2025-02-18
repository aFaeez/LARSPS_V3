import { Row, Col, Card, CardTitle, CardText, CardBody } from "reactstrap";
import { useSession } from "../context/SessionContext";
import React, { useEffect } from 'react';

const MasterPage = () => {
    const { userId, isITAdmin, connDb, systemName, companyName } = useSession();
    // Log the session values
    useEffect(() => {
        console.log('Dashboard - SessionContext:', {
            userId,
            isITAdmin,
            connDb,
            systemName,
            companyName
        });
    }, [userId, isITAdmin, connDb, systemName, companyName]);
    console.log(sessionStorage.getItem('UserId'));
    console.log(sessionStorage.getItem('IsITAdmin'));

    return (
        <div>
            <Row>
                <Col lg="12">
                    <Card body className="text-center">
                        <CardTitle>LARSPSV3</CardTitle>
                        <CardBody>
                            <CardText tag="h3">Welcome to LARSPSV3 system</CardText>

                            <p>User ID: {userId}</p>
                            <p>IT Admin: {isITAdmin}</p>
                            <p>DB Connection: {connDb}</p>
                            <p>System Name: {systemName}</p>
                            <p>Company Name: {companyName}</p>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default MasterPage;
