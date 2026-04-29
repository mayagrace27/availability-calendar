import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  CheckInDatePicker,
  formatBookingDate,
  startOfDay,
} from "./CheckInDatePicker";
import styles from "./NoHotelsPage.module.css";
import logoDesktopUrl from "./assets/Logo.svg";
/** Raster + SVG exports aligned to Figma `9:6010` (1200+ NDA) */
import fotoramaMain from "./assets/figma-9-6010/fotorama-main.jpg";
import galleryGrid1 from "./assets/figma-9-6010/gallery-grid-1.jpg";
import galleryGrid2 from "./assets/figma-9-6010/gallery-grid-2.jpg";
import galleryGrid3 from "./assets/figma-9-6010/gallery-grid-3.jpg";
import galleryGrid4 from "./assets/figma-9-6010/gallery-grid-4.jpg";
import hotelNearbyThumb from "./assets/figma-9-6010/hotel-nearby-thumb.png";
import distanceBadgeIcon from "./assets/figma-9-6010/distance-badge-icon.svg";
import showAllPhotosIconUrl from "./assets/figma-9-6010/show-all-photos-icon.svg";
import starRating from "./assets/figma-9-6010/star-rating.svg";
import amenityWifi from "./assets/figma-9-6010/amenity-wifi.svg";
import amenityCoffee from "./assets/figma-9-6010/amenity-coffee.svg";
import { CarouselNavArrow, HeaderPhoneIcon, MobileMenuIcon } from "./ndaIcons";

function HeaderChevronDown() {
  return (
    <svg className={styles.headerChevron} width={14} height={14} viewBox="0 0 14 14" aria-hidden>
      <path
        d="M3.5 5.25L7 8.75L10.5 5.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SelectChevron() {
  return (
    <svg
      className={styles.selectChevron}
      width={14}
      height={14}
      viewBox="0 0 14 14"
      aria-hidden
    >
      <path
        d="M3.5 5.25L7 8.75L10.5 5.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Booking form date fields `73:879` / `118:3721` — outline calendar, inline SVG (same as chevrons: no remote asset, no flex stretch) */
function CalendarIcon() {
  return (
    <svg
      className={styles.calendarIcon}
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M16 2v4M8 2v4M3 10h18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function formatTripSummaryRange(checkIn: Date, checkOut: Date): string {
  return `${formatBookingDate(checkIn)} - ${formatBookingDate(checkOut)}`;
}

function SearchWidget({
  checkIn,
  checkOut,
  setCheckIn,
  setCheckOut,
}: {
  checkIn: Date;
  checkOut: Date;
  setCheckIn: Dispatch<SetStateAction<Date>>;
  setCheckOut: Dispatch<SetStateAction<Date>>;
}) {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const checkInAnchorRef = useRef<HTMLDivElement>(null);
  const checkOutAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!checkInOpen && !checkOutOpen) return;
    function onDocMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      if (checkInOpen && !checkInAnchorRef.current?.contains(t)) {
        setCheckInOpen(false);
      }
      if (checkOutOpen && !checkOutAnchorRef.current?.contains(t)) {
        setCheckOutOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [checkInOpen, checkOutOpen]);

  return (
    <div className={styles.bookingForm} data-node-id="73:879">
      <div
        ref={checkInAnchorRef}
        className={`${styles.bookingField} ${styles.fieldCheckIn} ${styles.checkInAnchor}`}
      >
        <button
          type="button"
          className={styles.fieldInputShell}
          onClick={() => {
            setCheckOutOpen(false);
            setCheckInOpen((o) => !o);
          }}
          aria-expanded={checkInOpen}
          aria-haspopup="dialog"
        >
          <p className={styles.fieldCaption}>Check-in</p>
          <div className={styles.dateValueRow}>
            <span className={styles.dateValue}>{formatBookingDate(checkIn)}</span>
            <CalendarIcon />
          </div>
        </button>
        {checkInOpen ? (
          <CheckInDatePicker
            selected={checkIn}
            onSelect={(d) => {
              setCheckIn(d);
              setCheckOut(addDays(d, 1));
              setCheckInOpen(false);
              setCheckOutOpen(true);
            }}
            onClose={() => setCheckInOpen(false)}
          />
        ) : null}
      </div>
      <div
        ref={checkOutAnchorRef}
        className={`${styles.bookingField} ${styles.fieldCheckOut} ${styles.checkInAnchor}`}
      >
        <button
          type="button"
          className={styles.fieldInputShell}
          onClick={() => {
            setCheckInOpen(false);
            setCheckOutOpen((o) => !o);
          }}
          aria-expanded={checkOutOpen}
          aria-haspopup="dialog"
        >
          <p className={styles.fieldCaption}>Check-out</p>
          <div className={styles.dateValueRow}>
            <span className={styles.dateValue}>{formatBookingDate(checkOut)}</span>
            <CalendarIcon />
          </div>
        </button>
        {checkOutOpen ? (
          <CheckInDatePicker
            mode="checkOut"
            checkInDate={checkIn}
            selected={checkOut}
            onSelect={(d) => {
              setCheckOut(d);
              setCheckOutOpen(false);
            }}
            onClose={() => setCheckOutOpen(false)}
          />
        ) : null}
      </div>
      <button type="button" className={`${styles.bookingField} ${styles.fieldSelect} ${styles.fieldRooms}`}>
        <div className={styles.selectInner}>
          <p className={styles.fieldCaption}>Rooms</p>
          <div className={styles.selectValueRow}>
            <span className={styles.selectValue}>1</span>
            <SelectChevron />
          </div>
        </div>
      </button>
      <button type="button" className={`${styles.bookingField} ${styles.fieldSelect} ${styles.fieldAdults}`}>
        <div className={styles.selectInner}>
          <p className={styles.fieldCaption}>Adults</p>
          <div className={styles.selectValueRow}>
            <span className={styles.selectValue}>2</span>
            <SelectChevron />
          </div>
        </div>
      </button>
      <button type="button" className={`${styles.bookingField} ${styles.fieldSelect} ${styles.fieldKids}`}>
        <div className={styles.selectInner}>
          <p className={styles.fieldCaption}>Kids</p>
          <div className={styles.selectValueRow}>
            <span className={styles.selectValue}>0</span>
            <SelectChevron />
          </div>
        </div>
      </button>
      <div className={styles.ctaWrap}>
        <button type="button" className={styles.cta}>
          Find Rooms
        </button>
      </div>
    </div>
  );
}

function Breadcrumbs() {
  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <a href="#">Home</a>
      <span className={styles.breadcrumbSep} aria-hidden>
        &gt;
      </span>
      <a href="#">Countries</a>
      <span className={styles.breadcrumbSep} aria-hidden>
        &gt;
      </span>
      <a href="#">U.S.A.</a>
      <span className={styles.breadcrumbSep} aria-hidden>
        &gt;
      </span>
      <a href="#">Las Vegas</a>
      <span className={styles.breadcrumbSep} aria-hidden>
        &gt;
      </span>
      <span className={styles.breadcrumbCurrent}>Caesars Palace Las Vegas</span>
    </nav>
  );
}

/** Trip summary + nearby — fixed snapshot dates (check-in Apr 11 → next-day check-out); independent of the booking form. */
const staticTripCheckIn = startOfDay(new Date(2026, 3, 11));
const staticTripCheckOut = addDays(staticTripCheckIn, 1);

export function NoHotelsPage() {
  const [checkIn, setCheckIn] = useState(() => staticTripCheckIn);
  const [checkOut, setCheckOut] = useState(() => addDays(staticTripCheckIn, 1));
  const tripSummaryCheckIn = useRef(staticTripCheckIn);
  const tripSummaryCheckOut = useRef(staticTripCheckOut);

  const tripSummaryRange = formatTripSummaryRange(
    tripSummaryCheckIn.current,
    tripSummaryCheckOut.current,
  );

  return (
    <div className={styles.page} data-node-id="67:710">
      {/* Mobile header — Figma mobile */}
      <header className={styles.headerMobile}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <div className={styles.logoImageRow} aria-hidden>
              <img className={styles.logoLockupMobile} src={logoDesktopUrl} alt="" />
            </div>
            <p className={styles.tagline}>An independent travel network</p>
          </div>
        </div>
        <button type="button" className={styles.menuBtn} aria-label="Open menu">
          <MobileMenuIcon className={styles.menuIcon} />
        </button>
      </header>

      {/* Desktop header — Figma `88:935` / menu `69:1111` */}
      <header className={styles.headerDesktop}>
        <div className={styles.headerDesktopInner}>
          <div className={styles.headerDesktopBrand}>
            <img
              className={styles.headerDesktopLogoLockup}
              src={logoDesktopUrl}
              alt="Guest Reservations — An independent travel network"
              width={201}
              height={38}
              decoding="async"
            />
          </div>
          <nav className={styles.headerDesktopNav} aria-label="Primary">
            <a href="#">Groups (9+ Rooms)</a>
            <a href="#">Travel Guides</a>
            <a href="#">My Booking</a>
          </nav>
          <div className={styles.headerDesktopTools}>
            <button type="button" className={styles.headerToolCell}>
              <span>English</span>
              <HeaderChevronDown />
            </button>
            <button type="button" className={styles.headerToolCell}>
              <span>$ USD</span>
              <HeaderChevronDown />
            </button>
            <a className={styles.headerCallCell} href="tel:+18333145587">
              <span className={styles.headerCallRow}>
                <HeaderPhoneIcon className={styles.headerCallIcon} />
                <span className={styles.headerCallLabel}>Call now</span>
              </span>
              <span className={styles.headerCallNum}>(833) 314-5587</span>
            </a>
          </div>
        </div>
      </header>

      <div className={styles.phoneBar}>
        <a className={styles.phone} href="tel:+10000000000">
          (000) 000-0000
        </a>
      </div>

      <main className={styles.main}>
        <Breadcrumbs />

        <section className={styles.carousel} aria-label="Property photos">
          <img
            className={styles.carouselImg}
            src={fotoramaMain}
            alt="Caesars Palace Las Vegas"
          />
          <div className={styles.carouselNav}>
            <div className={styles.navSlot}>
              <button type="button" className={styles.navFab} aria-label="Previous photo">
                <CarouselNavArrow className={styles.navArrow} left />
              </button>
            </div>
            <div className={styles.navSlot}>
              <button type="button" className={styles.navFab} aria-label="Next photo">
                <CarouselNavArrow className={styles.navArrow} left={false} />
              </button>
            </div>
          </div>
          <div className={styles.dots} aria-hidden>
            <span className={`${styles.dot} ${styles.dotActive}`} />
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </section>

        <section className={styles.galleryDesktop} aria-label="Property photo gallery">
          <div className={styles.galleryMain}>
            <img src={fotoramaMain} alt="" />
          </div>
          <div className={styles.gallerySide}>
            <div className={styles.galleryThumb}>
              <img src={galleryGrid1} alt="" />
            </div>
            <div className={styles.galleryThumb}>
              <img src={galleryGrid2} alt="" />
            </div>
            <div className={styles.galleryThumb}>
              <img src={galleryGrid3} alt="" />
            </div>
            <div className={styles.galleryThumb}>
              <img src={galleryGrid4} alt="" />
            </div>
            <button type="button" className={styles.showAllPhotos}>
              <img
                className={styles.showAllPhotosIcon}
                src={showAllPhotosIconUrl}
                alt=""
                width={20}
                height={20}
              />
              Show all photos
            </button>
          </div>
        </section>

        <div className={styles.tripBlock}>
          <h1 className={styles.hotelName}>Caesars Palace Las Vegas</h1>
          <div className={`${styles.summary} ${styles.summaryMobileOnly}`}>
            <p className={styles.summaryLine}>
              <strong>Your trip summary:</strong>
              <span> {tripSummaryRange}</span>
            </p>
            <p className={styles.summaryLine}>Rooms: 1, Adults: 2</p>
          </div>
          <p className={`${styles.summary} ${styles.summaryDesktopOnly}`}>
            <strong>Your trip summary:</strong> {tripSummaryRange}{" "}
            <span className={styles.summaryPipe}>|</span> Rooms: 1, Adults: 2
          </p>
        </div>

        <hr className={styles.rule} />

        <section className={styles.nda}>
          <p className={styles.message}>
            Sorry, we have no availability for your selected dates. Check alternate dates or nearby
            hotels to continue your booking.
          </p>
          <SearchWidget
            checkIn={checkIn}
            checkOut={checkOut}
            setCheckIn={setCheckIn}
            setCheckOut={setCheckOut}
          />
        </section>

        <hr className={styles.rule} />

        <section className={styles.nearby} aria-labelledby="nearby-heading">
          <div className={styles.nearbyIntro}>
            <h2 id="nearby-heading" className={styles.nearbyTitle}>
              5 Available Hotels Nearby
            </h2>
            <p className={styles.nearbySubtitle}>
              Available for {tripSummaryRange}
            </p>
          </div>
          <div className={styles.nearbyGrid}>
            <div className={styles.hotelList}>
              <article className={styles.hotelCard}>
                <div className={styles.hotelThumb}>
                  <img src={hotelNearbyThumb} alt="" />
                  <span className={styles.distanceBadge}>
                    <img
                      className={styles.distancePinIcon}
                      src={distanceBadgeIcon}
                      alt=""
                      width={16}
                      height={16}
                      decoding="async"
                    />
                    <span className={styles.distanceLabel}>.5 miles away</span>
                  </span>
                </div>
                <div className={styles.hotelBody}>
                  <div className={styles.hotelInfo}>
                    <h3 className={styles.hotelCardTitle}>The Venetian Resort Las Vegas</h3>
                    <img className={styles.starRow} src={starRating} alt="" />
                    <p className={styles.hotelAddress}>3355 S Las Vegas Blvd, Las Vegas, NV 89109</p>
                    <div className={styles.amenities}>
                      <span className={styles.amenity}>
                        <img className={styles.amenityIcon} src={amenityWifi} alt="" /> Free Wifi
                      </span>
                      <span className={styles.amenity}>
                        <img className={styles.amenityIcon} src={amenityCoffee} alt="" /> Free Full Breakfast
                      </span>
                    </div>
                    <button type="button" className={styles.moreAmenities}>
                      More amenities
                    </button>
                  </div>
                  <div className={styles.hotelPricing}>
                    <div className={styles.priceBlock}>
                      <p className={styles.perNight}>$XXX</p>
                      <p className={styles.perNightLabel}>per night</p>
                    </div>
                    <p className={styles.totalStay}>
                      Total stay: <strong>$X,XXX</strong>
                    </p>
                    <p className={styles.taxes}>+$XX taxes</p>
                    <button type="button" className={styles.bookNow}>
                      Book Now
                    </button>
                  </div>
                </div>
              </article>
              <article className={styles.hotelCard}>
                <div className={styles.hotelThumb}>
                  <img src={hotelNearbyThumb} alt="" />
                  <span className={styles.distanceBadge}>
                    <img
                      className={styles.distancePinIcon}
                      src={distanceBadgeIcon}
                      alt=""
                      width={16}
                      height={16}
                      decoding="async"
                    />
                    <span className={styles.distanceLabel}>.5 miles away</span>
                  </span>
                </div>
                <div className={styles.hotelBody}>
                  <div className={styles.hotelInfo}>
                    <h3 className={styles.hotelCardTitle}>The Venetian Resort Las Vegas</h3>
                    <img className={styles.starRow} src={starRating} alt="" />
                    <p className={styles.hotelAddress}>3355 S Las Vegas Blvd, Las Vegas, NV 89109</p>
                    <div className={styles.amenities}>
                      <span className={styles.amenity}>
                        <img className={styles.amenityIcon} src={amenityWifi} alt="" /> Free Wifi
                      </span>
                      <span className={styles.amenity}>
                        <img className={styles.amenityIcon} src={amenityCoffee} alt="" /> Free Full Breakfast
                      </span>
                    </div>
                    <button type="button" className={styles.moreAmenities}>
                      More amenities
                    </button>
                  </div>
                  <div className={styles.hotelPricing}>
                    <div className={styles.priceBlock}>
                      <p className={styles.perNight}>$XXX</p>
                      <p className={styles.perNightLabel}>per night</p>
                    </div>
                    <p className={styles.totalStay}>
                      Total stay: <strong>$X,XXX</strong>
                    </p>
                    <p className={styles.taxes}>+$XX taxes</p>
                    <button type="button" className={styles.bookNow}>
                      Book Now
                    </button>
                  </div>
                </div>
              </article>
              <article className={styles.hotelCard}>
                <div className={styles.hotelThumb}>
                  <img src={hotelNearbyThumb} alt="" />
                  <span className={styles.distanceBadge}>
                    <img
                      className={styles.distancePinIcon}
                      src={distanceBadgeIcon}
                      alt=""
                      width={16}
                      height={16}
                      decoding="async"
                    />
                    <span className={styles.distanceLabel}>.5 miles away</span>
                  </span>
                </div>
                <div className={styles.hotelBody}>
                  <div className={styles.hotelInfo}>
                    <h3 className={styles.hotelCardTitle}>The Venetian Resort Las Vegas</h3>
                    <img className={styles.starRow} src={starRating} alt="" />
                    <p className={styles.hotelAddress}>3355 S Las Vegas Blvd, Las Vegas, NV 89109</p>
                    <div className={styles.amenities}>
                      <span className={styles.amenity}>
                        <img className={styles.amenityIcon} src={amenityWifi} alt="" /> Free Wifi
                      </span>
                      <span className={styles.amenity}>
                        <img className={styles.amenityIcon} src={amenityCoffee} alt="" /> Free Full Breakfast
                      </span>
                    </div>
                    <button type="button" className={styles.moreAmenities}>
                      More amenities
                    </button>
                  </div>
                  <div className={styles.hotelPricing}>
                    <div className={styles.priceBlock}>
                      <p className={styles.perNight}>$XXX</p>
                      <p className={styles.perNightLabel}>per night</p>
                    </div>
                    <p className={styles.totalStay}>
                      Total stay: <strong>$X,XXX</strong>
                    </p>
                    <p className={styles.taxes}>+$XX taxes</p>
                    <button type="button" className={styles.bookNow}>
                      Book Now
                    </button>
                  </div>
                </div>
              </article>
              <article className={styles.hotelCard}>
                <div className={styles.hotelThumb}>
                  <img src={hotelNearbyThumb} alt="" />
                  <span className={styles.distanceBadge}>
                    <img
                      className={styles.distancePinIcon}
                      src={distanceBadgeIcon}
                      alt=""
                      width={16}
                      height={16}
                      decoding="async"
                    />
                    <span className={styles.distanceLabel}>.5 miles away</span>
                  </span>
                </div>
                <div className={styles.hotelBody}>
                  <div className={styles.hotelInfo}>
                    <h3 className={styles.hotelCardTitle}>The Venetian Resort Las Vegas</h3>
                    <img className={styles.starRow} src={starRating} alt="" />
                    <p className={styles.hotelAddress}>3355 S Las Vegas Blvd, Las Vegas, NV 89109</p>
                    <div className={styles.amenities}>
                      <span className={styles.amenity}>
                        <img className={styles.amenityIcon} src={amenityWifi} alt="" /> Free Wifi
                      </span>
                      <span className={styles.amenity}>
                        <img className={styles.amenityIcon} src={amenityCoffee} alt="" /> Free Full Breakfast
                      </span>
                    </div>
                    <button type="button" className={styles.moreAmenities}>
                      More amenities
                    </button>
                  </div>
                  <div className={styles.hotelPricing}>
                    <div className={styles.priceBlock}>
                      <p className={styles.perNight}>$XXX</p>
                      <p className={styles.perNightLabel}>per night</p>
                    </div>
                    <p className={styles.totalStay}>
                      Total stay: <strong>$X,XXX</strong>
                    </p>
                    <p className={styles.taxes}>+$XX taxes</p>
                    <button type="button" className={styles.bookNow}>
                      Book Now
                    </button>
                  </div>
                </div>
              </article>
              <article className={styles.hotelCard}>
                <div className={styles.hotelThumb}>
                  <img src={hotelNearbyThumb} alt="" />
                  <span className={styles.distanceBadge}>
                    <img
                      className={styles.distancePinIcon}
                      src={distanceBadgeIcon}
                      alt=""
                      width={16}
                      height={16}
                      decoding="async"
                    />
                    <span className={styles.distanceLabel}>.5 miles away</span>
                  </span>
                </div>
                <div className={styles.hotelBody}>
                  <div className={styles.hotelInfo}>
                    <h3 className={styles.hotelCardTitle}>The Venetian Resort Las Vegas</h3>
                    <img className={styles.starRow} src={starRating} alt="" />
                    <p className={styles.hotelAddress}>3355 S Las Vegas Blvd, Las Vegas, NV 89109</p>
                    <div className={styles.amenities}>
                      <span className={styles.amenity}>
                        <img className={styles.amenityIcon} src={amenityWifi} alt="" /> Free Wifi
                      </span>
                      <span className={styles.amenity}>
                        <img className={styles.amenityIcon} src={amenityCoffee} alt="" /> Free Full Breakfast
                      </span>
                    </div>
                    <button type="button" className={styles.moreAmenities}>
                      More amenities
                    </button>
                  </div>
                  <div className={styles.hotelPricing}>
                    <div className={styles.priceBlock}>
                      <p className={styles.perNight}>$XXX</p>
                      <p className={styles.perNightLabel}>per night</p>
                    </div>
                    <p className={styles.totalStay}>
                      Total stay: <strong>$X,XXX</strong>
                    </p>
                    <p className={styles.taxes}>+$XX taxes</p>
                    <button type="button" className={styles.bookNow}>
                      Book Now
                    </button>
                  </div>
                </div>
              </article>
            </div>
            <div className={styles.mapPane} role="presentation" aria-hidden />
          </div>
        </section>
      </main>
    </div>
  );
}
