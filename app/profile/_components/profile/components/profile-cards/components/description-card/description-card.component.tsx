import {
  Container,
  DescriptionHeading,
  DescriptionText,
  Description,
} from '@/app/_components/cards/right-card/right-card.styled';

export type Props = {
  description: string | undefined;
};

export const DescriptionCard: React.FC<Props> = ({ description }) => {
  return (
    <Container>
      <Description>
        <DescriptionHeading>Description</DescriptionHeading>
        <DescriptionText>{description || 'Description was not provided'}</DescriptionText>
      </Description>
    </Container>
  );
};