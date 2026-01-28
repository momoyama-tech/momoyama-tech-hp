import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, params, parent }) => {
    const parentData = await parent();
    const preFetchedArticle = parentData.news?.find(
        (item: any) => item.title === params.title
    );

    const article: any = preFetchedArticle || data?.article;

    return {
        ...data,
        article,
        coverImage: article?.coverImage,
        title: params.title
    };
};
