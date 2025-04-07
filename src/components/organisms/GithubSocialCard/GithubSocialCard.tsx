import { SocialCard } from '@/components/molecules/SocialCard';
import { useLoaderData } from '@tanstack/react-router';

export const GithubSocialCard = () => {
  const data = useLoaderData({
    strict: false,
  });
  return (
    <SocialCard
      title="@leo-petrucci"
      subTitle={`${data?.totalContributions} contributions`}
      companyName="Github"
      companyLogo="/GithubLogo.svg"
      bgColor="#AED2A9"
      to="https://github.com/leo-petrucci"
    />
  );
};
