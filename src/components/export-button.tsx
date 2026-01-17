"use client";

export function ExportButton() {
  return (
    <div className="bg-[#1e1e1e] flex gap-[12px] items-center pl-[8px] pr-[16px] py-[6px] h-[44px] rounded-[16px]">
      <button 
        disabled
        className="bg-[#333] flex gap-[10px] items-center justify-center pl-[10px] pr-[16px] py-0 h-full w-fit rounded-[10px] shrink-0 cursor-not-allowed select-none"
      >
        <div className="relative shrink-0 w-[24px] h-[24px]">
          <svg
            preserveAspectRatio="none"
            width="24"
            height="24"
            overflow="visible"
            style={{ display: "block" }}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="Frame">
              <path
                id="Vector"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4 14C4.55228 14 5 14.4477 5 15V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V15C19 14.4477 19.4477 14 20 14C20.5523 14 21 14.4477 21 15V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V15C3 14.4477 3.44772 14 4 14Z"
                fill="#5A5A5A"
              />
              <path
                id="Vector_2"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 15.5C12.2652 15.5 12.5196 15.3946 12.7071 15.2071L16.2071 11.7071C16.5976 11.3166 16.5976 10.6834 16.2071 10.2929C15.8166 9.90237 15.1834 9.90237 14.7929 10.2929L13 12.0858V4C13 3.44771 12.5523 3 12 3C11.4477 3 11 3.44771 11 4V12.0858L9.20711 10.2929C8.81658 9.90237 8.18342 9.90237 7.79289 10.2929C7.40237 10.6834 7.40237 11.3166 7.79289 11.7071L11.2929 15.2071C11.4804 15.3946 11.7348 15.5 12 15.5Z"
                fill="#5A5A5A"
              />
            </g>
          </svg>
        </div>
        <p className="text-[#f4f5f6] text-[13px] font-[550] leading-normal opacity-20">
          Export as printout
        </p>
      </button>
      <p className="text-[#5a5a5a] text-[13px] font-[550] leading-normal shrink-0">
        Coming soon
      </p>
    </div>
  );
}
