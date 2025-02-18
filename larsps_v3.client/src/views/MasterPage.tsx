import { Row, Col, Card, CardTitle, CardText, CardBody } from "reactstrap";
const MasterPage = () => {
    return (
        <div>
            <Row>
                <Col lg="12">
                    <Card body className="text-center">
                        <CardTitle>LARSPSV3</CardTitle>
                        <CardBody> <CardText tag="h3">Welcome to LARSPSV3 system</CardText></CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default MasterPage;
