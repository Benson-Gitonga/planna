'use Client'
import {Card} from 'react-bootstrap';

const StatCard = ({title, value, description}) => {
    return (
        <Card className="text-center mb-3">
            <Card.Body>
                <Card.Title className='h5'>{title}</Card.Title>
                <Card.Text className="display-6">{value}</Card.Text>
                {description && <Card.Text className="text-muted">{description}</Card.Text>}
            </Card.Body>
        </Card>
    )
}
export default StatCard;