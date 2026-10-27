import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, ImageIcon, User } from 'lucide-react';
import { storageUrl } from '../utils/storageUrl';
import { useApiErrorHandler } from '../hooks/useApiErrorHandler';
import { ArticleDetailPayload } from '../types/article';
import { getArticle, getArticleBanner } from '../services/articlesApi';
import { Banner } from '../types/banner';
import { ApiError } from '../lib/api';
import dateFormatter from '../utils/dateFormatter';
import { WhatsappShareButton, FacebookShareButton, XShareButton, EmailShareButton, EmailLegacyIcon, XLegacyIcon, FacebookLegacyIcon, WhatsappLegacyIcon } from "react-share";

const ArticleDetail: React.FC = () => {

  const { slug } = useParams();
  const [detailArticle, setDetailArticle] = useState<ArticleDetailPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isEmptyBanner, setIsEmptyBanner] = useState<boolean>(false);
  const handleApiError = useApiErrorHandler();
  const imgUrl = detailArticle?.data?.image ? storageUrl(detailArticle.data.image) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    getArticle(String(slug))
    .then(res => {
      setDetailArticle(res);
    }).catch((err) => {
      setError(true);
      handleApiError(err);
    }).finally(()=> {
      setIsLoading(false);
    });

    getArticleBanner()
      .then(res => {
        if(res.length === 0) {
          setIsEmptyBanner(true);
        }
        const [banner] = res;
        setBanner(banner);
      })
      .catch(err => {
        setIsEmptyBanner(true);
        if(err instanceof ApiError) {
          handleApiError(err);
        }
      });

  }, [slug]);

  useEffect(() => {
    if(!imgUrl) return;

    setIsLoadingImage(true);

    const img = new Image();
    img.src = imgUrl;

    img.onload = () => {
      setIsLoadingImage(false);
    }

    img.onerror = () => {
      setIsLoadingImage(false);
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    }
  },[imgUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Memuat artikel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Artikel tidak ditemukan</h2>
          <p className="text-gray-600 mb-6">
            Maaf, artikel yang Anda cari tidak ditemukan.
          </p>
          <Link
            to={"/artikel"}
            className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-md shadow transition-colors duration-300"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Image */}
        <div
          className="w-full h-[50vh] bg-cover bg-center relative"
          style={{ backgroundImage: `url(${storageUrl(banner?.image)})` }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
            <div className="absolute top-[20%] w-full p-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 font-heading">
                    {banner?.title ? banner?.title : isEmptyBanner ? "Judul tidak tersedia" : "Memuat judul..."}
                    </h1>
                    <span className="text-gray-300 font-medium text-lg px-3 py-1">
                    {banner?.description ? banner?.description : isEmptyBanner ? "Deskripsi tidak tersedia" : "Memuat deskripsi..."}
                    </span>
                </div>
            </div>
            <div className="absolute place-self-center bottom-10 text-white text-center">
                <span><a className="underline" href="/artikel">Artikel</a> / <a className="underline" href={`${detailArticle?.data.slug}`}>{detailArticle?.data.title}</a></span>
            </div> 
        </div>
        

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Main Content */}
            <div className="flex flex-col mb-10 items-center max-w-screen-lg px-6 mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">{detailArticle?.data.title}</h2>
                <div className="flex gap-4">
                    <span className="flex gap-1"><User className="w-4"/>{detailArticle?.data.user}</span> 
                    <span className="flex gap-1"><Calendar className="w-4"/> {dateFormatter(detailArticle?.data.date)}</span>
                </div>
            </div>
            <div className="flex justify-center px-6 mb-4">
              { isLoadingImage ? 
                  <div className="w-full h-[200px] animate-pulse md:w-[65%] md:h-[480px] rounded-md bg-black/50 flex justify-center items-center">
                    <ImageIcon size={64} color='#fff'/>
                  </div>
                  :
                  <img src={storageUrl(detailArticle?.data.image)} className="md:w-[65%] rounded-md" alt="" />
              }
            </div>
            <div className="w-[100%] prose text-md mx-auto max-w-screen-lg p-6 mb-4" dangerouslySetInnerHTML={{__html: `${detailArticle?.data.content}`}}></div>
            <div className="mx-auto max-w-screen-lg px-6 mb-14 text-gray-700 text-right">
              <span className="inline-block mb-4">Bagikan artikel ini melalui :</span>
              <div className="flex justify-end gap-2">
                <WhatsappShareButton
                  message={detailArticle?.data.title}
                  mobileBehavior="auto"
                  url={window.location.href}
                  aria-label="Share on WhatsApp"
                  htmlTitle='WhatsApp'
                >
                  <WhatsappLegacyIcon size={28} color='gray' borderRadius={12} />
                </WhatsappShareButton>
                <FacebookShareButton url={window.location.href} aria-label="Share on Facebook">
                  <FacebookLegacyIcon size={28} color='gray' borderRadius={12} />
                </FacebookShareButton>
                <XShareButton
                text={detailArticle?.data.title}
                htmlTitle="X"
                url={window.location.href}
                aria-label="Share on X"
                >
                  <XLegacyIcon size={28} color='gray' borderRadius={12} />
                </XShareButton>
                <EmailShareButton
                  subject={`VisitTemajuk - ${detailArticle?.data.title}`}
                  body={detailArticle?.data.title}
                  url={window.location.href}
                  aria-label="Share by Email"
                  >
                  <EmailLegacyIcon size={28} color='gray' borderRadius={12} />
                </EmailShareButton>
              </div>

            </div>
            <div className={`mx-auto max-w-screen-lg grid grid-cols-2 gap-4 px-6`}>
              { detailArticle?.meta.prev.slug &&
                <a href={detailArticle?.meta.prev.slug} className={`col-start-1 col-end-1 flex items-center gap-4 cursor-pointer text-gray-600 hover:text-gray-800 hover:shadow-md border border-gray p-3 rounded-lg`}>
                <ChevronLeft className="hidden md:block"/>
                <div className="flex flex-col gap-2">
                  <span className="font-medium">Sebelumnya</span>
                  <span>{detailArticle?.meta.prev.title && detailArticle?.meta.prev.title.substring(0,45)}...</span>
                </div>
                </a>
              }
              { detailArticle?.meta.next.slug &&
                <a href={detailArticle?.meta.next.slug} className="col-start-2 col-end-2 flex flex-row-reverse items-center gap-4 cursor-pointer text-gray-600 hover:text-gray-800 hover:shadow-md border border-gray p-3 rounded-lg">
                  <ChevronRight className="hidden md:block"/>
                  <div className="flex flex-col gap-2 text-right">
                    <span className="font-medium">Berikutnya</span>
                    <span>{detailArticle?.meta.next.title && detailArticle?.meta.next.title.substring(0,45)}...</span>
                  </div>
                </a>
              } 
            </div>
      </div>
    </div>
  );
};

export default ArticleDetail;