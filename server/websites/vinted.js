import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';

const COOKIE = "v_udt=RHZLV1RtZEpmdnZNNjVJSkR0MDJIdEp4SWZ2UC0taXpUQmZiTlpBK3pXakFaLy0teEdabjlhY2pSQ0ZySDAxYzVLYVhNQT09; anon_id=4f45ab87-f876-40eb-9aeb-8d236c8e72ef; anonymous-locale=fr; is_shipping_fees_applied_info_banner_dismissed=false; OptanonAlertBoxClosed=2026-01-27T12:57:04.505Z; eupubconsent-v2=CQer3NgQer3NgAcABBFRCPFgAAAAAEPgAAwIAAAWZABMNCogjLIgACBQMAIEACgrCACgQBAAAkDRAQAmDAhyBgAusJkAIAUAAwQAgABBgACAAASABCIAKACAQAgQCBQABgAQBAQAMDAAGACxEAgABAdAxTAggECwASMyqDTAlAASCAlsqEEgCBBXCEIs8AggREwUAAAIABQAAADwWAhJICViQQBcQTQAAEAAAUQIECKQswBBQGaLQVgScBkaYBg-YJklOgyAJghIyDIhN-Ew8UhRAAAA.YAAACHwAAAAA.ILNtR_G__bXlv-Tb36fpkeYxf99hr7sQxBgbJs24FzLvW7JwS32E7NEzatqYKmRIAu3TBIQNtHJjURVChKIgVrzDsaEyUoTtKJ-BkiDMRY2JYCFxvm4pjWQCZ4vr_91d9mT-N7dr-2dzyy5hnv3a9_-S1UJicKYetHfn8ZBKT-_IU9_x-_4v4_MbpE2-eS1v_tGvt43d-4tP_dpuxt-Tyffz___f72_e7X__c__33_-_Xf_7__4A; OTAdditionalConsentString=1~; domain_selected=true; sharedid=1ec8b134-583d-46d0-bf24-a20ddf0bdff6; sharedid_cst=TmEpiA%3D%3D; non_dot_com_www_domain_cookie_buster=1; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzczNzY3MzQwLCJpYXQiOjE3NzMxNjI1NDAsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJyZWZyZXNoIiwic2NvcGUiOiJwdWJsaWMiLCJzaWQiOiJlZmNkM2FiOC0xNzczMTYyNTQwIn0.vpvg23U81fKGWN1b4wH815CztdAkTUhQvt2nr8pbT3bABiosCv7aUnOOKkiBdLDrg4GCZ-Is0mVApfa1rUWwjvJ55tP4RVOPs2iKHFTUfxEMYXw3tHrY2uPVZmaTFo5FiF76M0jBwTubVNhOObfzHHVBtIyHQtB09554p7jBcgoP4_GN7H43xpY47W7XOrbEIlWpmXI9f4H3eF7Mpyt2TCco1LoZJ0Zq0uLYCHp01S0GoHqYYePqAvx8bj2kM0v57wySun7wiD6R6CYCeM0wSALkh5pH-qPfx3-gWLej9zW-1Z_sjHa2UG3_5Ux8SzZvzX4jaDt096jf03JWK0BBKg; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzczMTY5NzQwLCJpYXQiOjE3NzMxNjI1NDAsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJhY2Nlc3MiLCJzY29wZSI6InB1YmxpYyIsInNpZCI6ImVmY2QzYWI4LTE3NzMxNjI1NDAifQ.eURRobhgu61WAihH3Duv8v2AUsws1HyUHxe9b3QHL5CIyIDahZYK1hfR0wQ8pzBdbKcBJmdIsf6mIGnor83ADemaVvRE8Cp7zjAvUcCx3xg6O04BWwNvv90KM_CSZcfBaWZGvNpyxHz2HY66lWTHpI9TsYNaFcEnRpr-D2tOC13iIzWEXG5WSIvKSR19JMRxCf4Ka5Y6Tpk9dyO276hJ1E2Y4zuqf5MlNKrE1fsjlwJO7ms2QTWjQtL253kJzLljh4PBrtuBBC-WmjVTEUqgJNCuSdSL5S2I3hYnPaxQjNronFC4q17bRTJEiQ-PZ8FcQ7UEKnJlhtm1SDRtt8KFaA; v_sid=4fda20143b5f8d36df93d6c758daa402; v_sid=2fb8ee57ea5590a884232af666ce75cb; viewport_size=637; cf_clearance=T5fGM5gpmfYQ3vZop4YT2pW7YmQaqMpv5Cc3t9YHvsE-1773167132-1.2.1.1-S2SmRl.FcDNV9PRYzNSQnorUwBG2yW1WZ_e00Oyp.NI9ArKVP96RvaudrArUacUt5gReGjt6H1IdpjDjPWwOkYg1_nVytriVXiYk062jAdZkRZN2FQGalwjFRkfmeOzWFA_A6BICoE1OFnNBYFVxjdqiZhdpX2m78sGxM46AA4ABoecFGA_BQye7IZ15GhaW1p4_JLSVSLBKKCzr4w9SdsoKB0af9vJQN9lOrM76D4U; __cf_bm=NZTpIaYPqDSFo2BE6.9TqWVgghbGTixyPBNzkRWnNwA-1773167132.9387412-1.0.1.1-bMN8dAE9VBNANxdIfCuPzmfRLhT4RB18dnH1vDmKG4yorJWhXC4joEC.X.goBHshAowF234M0PVWqtkpYLwJSkNwBzw0uwNNaPBXD5Ps9ISHJqqn1mVSl81tk6o0m1Rgd480Ex.RoGshE3B62UqE4Q; banners_ui_state=SUCCESS; _vinted_fr_session=RDhNTmFFQkNuR2JvOVN0Q0xxcWJWejZWalJLWE1hQ00zWnVXNjh4NUlCaGtpRmx4VlNRb3IwVFh4VDRKak9reUpqVmZ3SXRnWmxwbDBnZEo2d2NkMkw4cmRjMEJkQUdwWU44ZUN4cldVN1NVck9nTTk4WXhja1lTK2oyNURsbUZkVnFueWk5K0oxRTVKbFU0S2ppb2RiVnAzMmM4ZDl1dUJsejdOc0cyVXhaYUd2OGYxL1ppS2p1MEoyeDNqTnRWR3UyNjdlZGNEQWM2L3MwRWFLZkNCVE9yYTh5TExOMlUrOWYvUVN1eHd4SkJsMlpCRHZ1ZHBESVRLVjF4Y0NKaS0tdnlwRGVTd1dJcmVCcXVuNG5mR3V5QT09--bc87f1d7b65ac15f8497aff288a173c21d28fec8; OptanonConsent=isGpcEnabled=0&datestamp=Tue+Mar+10+2026+19%3A25%3A33+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202512.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=4f45ab87-f876-40eb-9aeb-8d236c8e72ef&isAnonUser=1&hosts=&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0035%3A0%2CC0038%3A0&genVendors=V2%3A0%2CV1%3A0%2C&intType=2&crTime=1769518624705&geolocation=FR%3BIDF&AwaitingReconsent=false; datadome=Vw0pYr_ekpe6xIICkwBHOi4oaGrbWVDA1mTBdYxRCxZWNmPm6iCRG9NEsMIYwoIl1zeXpvzHcF1ymso2hSvunTPn8y2pqGOCCvTd1YOlZk5kGR8YXqPGZwsPD29Bcmrj; __eoi=ID=e2f31583371486e0:T=1769528205:RT=1773167136:S=AA-AfjasMErkORbsOCVIpvpGNNdO";

function isNotDefined(value) {
  return (value == null || (typeof value === "string" && value.trim().length === 0));
}

/**
 * Parse  
 * @param  {String} data - json response
 * @return {Object} sales
 */
const parse = data => {
  try {
    const {items} = data;

    return items.map(item => {
      const link = item.url;
      const price = item.total_item_price;
      const {photo} = item;
      const published = photo.high_resolution && photo.high_resolution.timestamp;

      return {
        link,
        price,
        title: item.title,
        published,
        'uuid': uuidv5(link, uuidv5.URL)
      }
    })
  } catch (error){
    console.error(error);
    return [];
  }
}



const scrape = async searchText => {
  try {

    if (isNotDefined(COOKIE)) {
      throw "vinted requires a valid cookie";
    }

    const response = await fetch(`https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1727382549&search_text=${searchText}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids`, {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": COOKIE
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET"
    });

    if (response.ok) {
      const body = await response.json();

      return parse(body);
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};


export {scrape};