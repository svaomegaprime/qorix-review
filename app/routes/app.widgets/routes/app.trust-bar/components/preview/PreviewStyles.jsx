export default function PreviewStyles() {
    return (
        <style>
            {`
                .trust-preview {
                    height: calc(100vh - 76px);
                    overflow: auto;
                    background: #b5b5b5;
                    padding: 50px;
                    box-sizing: border-box;
                }

                .trust-preview--mobile {
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                }

                .trust-preview__page {
                    min-width: 868px;
                    min-height: calc(100vh - 176px);
                    background: #fff;
                    padding: 40px 45px 90px;
                    box-sizing: border-box;
                }

                .trust-preview--mobile .trust-preview__page {
                    min-width: 0;
                    width: min(100%, 390px);
                    padding: 24px 16px 64px;
                }

                .trust-preview__heading {
                    margin: 0;
                    color: #202223;
                    font-size: 20px;
                    font-weight: 500;
                    line-height: 25px;
                }

                .trust-preview__product {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 20px;
                    align-items: stretch;
                    margin-top: 18px;
                }

                .trust-preview--mobile .trust-preview__product {
                    grid-template-columns: minmax(0, 1fr);
                }

                .trust-preview__placeholder {
                    background: #e7e7e7;
                    border-radius: 999px;
                }

                .trust-preview__product-image {
                    width: auto;
                    height: 100%;
                    aspect-ratio: 1 / 0.9;
                    border-radius: 7px;
                }

                .trust-preview--mobile .trust-preview__product-image {
                    width: 100%;
                    height: auto;
                    aspect-ratio: 1 / 1;
                }

                .trust-preview__product-form {
                    padding-top: 0;
                }

                .trust-preview__form-line {
                    height: 24px;
                }

                .trust-preview__form-line--title {
                    max-width: 300px;
                    width: 100%;
                    margin-bottom: 12px;
                }

                .trust-preview__form-line--subtitle {
                    max-width: 220px;
                    width: 100%;
                    margin-bottom: 16px;
                }

                .trust-preview__form-line--body {
                    max-width: 220px;
                    width: 100%;
                    margin-bottom: 16px;
                }

                .trust-preview__rating-row,
                .trust-preview__card-rating {
                    display: flex;
                    align-items: center;
                }

                .trust-preview__rating-row {
                    gap: 8px;
                    margin-bottom: 18px;
                    flex-wrap: wrap;
                }

                .trust-preview__stars {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    flex: none;
                }

                .trust-preview__stars svg {
                    width: 100%;
                    height: 100%;
                    display: block;
                }

                .trust-preview__rating-text,
                .trust-preview__verified,
                .trust-preview__price-row,
                .trust-preview__card-rating-text {
                    color: #3f3f3f;
                    line-height: 1;
                    font-size: 16px;
                    font-weight: 400;
                }

                .trust-preview__divider {
                    width: 1px;
                    height: 24px;
                    background: #d7d7d7;
                    margin-right: 2px;
                }

                .trust-preview__verified {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #6a6a6a;
                }

                .trust-preview__price-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 15px;
                }

                .trust-preview__currency {
                    font-size: 16px;
                    line-height: 1;
                }

                .trust-preview__price-line {
                    width: 70px;
                    height: 24px;
                }

                .trust-preview__quantity {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    align-items: center;
                    width: 120px;
                    height: 40px;
                    margin-top: 22px;
                    margin-bottom: 22px;
                    border: 1px solid #dcdcdc;
                    border-radius: 3px;
                    color: #4f4f4f;
                    font-size: 16px;
                    line-height: 1;
                    text-align: center;
                    box-sizing: border-box;
                }

                .trust-preview__button-row {
                    display: flex;
                    gap: 15px;
                }

                .trust-preview__button-placeholder {
                    width: 200px;
                    height: 40px;
                }

                .trust-preview__collection-section {
                    margin-top: 68px;
                }

                .trust-preview__cards {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }

                .trust-preview--mobile .trust-preview__cards {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 12px;
                }

                .trust-preview__card {
                    width: 100%;
                    height: auto;
                    aspect-ratio: 188 / 232;
                    padding: 10px;
                    border: 1px solid #efefef;
                    border-radius: 10px;
                    box-sizing: border-box;
                    overflow: hidden;
                }

                .trust-preview--mobile .trust-preview__card {
                    aspect-ratio: auto;
                    min-height: 214px;
                    padding: 8px;
                }

                .trust-preview__card-image {
                    width: 100%;
                    height: auto;
                    aspect-ratio: 1 / .75;
                    border-radius: 7px;
                }

                .trust-preview__card-line {
                    width: 100%;
                    height: 24px;
                }

                .trust-preview__card-line--wide {
                    margin-top: 15px;
                    margin-bottom: 15px;
                }

                .trust-preview__card-variants {
                    display: grid;
                    grid-template-columns: repeat(5, 24px);
                    gap: 10px;
                    margin-top: 12px;
                }
                
                .trust-preview__card-variant {
                    width: 100%;
                    height: auto;
                    aspect-ratio: 1 / 1;
                    border-radius: 100%;
                }

                .trust-preview__card-rating {
                    gap: 7px;
                    margin-top: 12px;
                    flex-wrap: wrap;
                }

                @media (max-width: 1100px) {
                    .trust-preview--mobile {
                        padding: 16px;
                    }
                }

                @media (max-width: 700px) {
                    .trust-preview {
                        padding: 16px;
                    }

                    .trust-preview__page {
                        padding: 20px 16px 56px;
                    }

                    .trust-preview__cards,
                    .trust-preview--mobile .trust-preview__cards {
                        grid-template-columns: minmax(0, 1fr);
                    }

                    .trust-preview__button-row {
                        flex-direction: column;
                    }

                    .trust-preview__button-placeholder {
                        width: 100%;
                    }
                }
            `}
        </style>
    )
}
