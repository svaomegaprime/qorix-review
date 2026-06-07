import TEMP_REQUESTS from "../data/requests.json";
import Loader from "../../../components/essentials/Loader";
import Text from "../../../components/essentials/elements/Text";
import TabButton from "../../../components/essentials/TabButton";
import CustomSection from "../../../components/essentials/CustomSection";
import Analytics from "../components/Analytics";
import RequestItem from "../components/RequestItem";
import { useLoaderData, useNavigation } from "react-router";
import { useState } from "react";

const REQUESTS_PER_PAGE = 5;
const MAX_VISIBLE_PAGE_BUTTONS = 4;
const TAB_CONFIG = [
    {
        key: "all",
        label: "All status",
        statuses: null,
        tone: "success",
    },
    {
        key: "sent",
        label: "Sent",
        statuses: ["Sent"],
        tone: "warning",
    },
    {
        key: "opened",
        label: "Opened",
        statuses: ["Opened"],
        tone: "success",
    },
    {
        key: "reviewed",
        label: "Reviewed",
        statuses: ["Reviewed"],
        tone: "success",
    },
    {
        key: "pending",
        label: "Pending",
        statuses: ["Pending", "Clicked"],
        tone: "warning",
    },
    {
        key: "failed",
        label: "Failed",
        statuses: ["Failed"],
        tone: "critical",
    },
];

export async function loader() {
  return {
    requests: TEMP_REQUESTS,
  };
}

export default function Requests() {
    // Start----Default CSR loading state checking for navigation
    const navigation = useNavigation();
    const loading = navigation.state === "loading";
    // End----Default CSR loading state checking for navigation

    // Start----Accessing loaded data using useLoaderData
    const { requests } = useLoaderData();
    // End----Accessing loaded data using useLoaderData

    // Start----State for active tab
    const [activeTab, setActiveTab] = useState("all");
    // End----State for active tab
    // Start----Requests pagination state
    const [currentPage, setCurrentPage] = useState(1);
    // End----Requests pagination state

    const [filteredRequests, setFilteredRequests] = useState(requests);

    // Start----Tab click handler
    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
        const tabConfig = TAB_CONFIG.find((item) => item.key === tab);

        if (!tabConfig?.statuses) {
            setFilteredRequests(requests);
        } else {
            const filtered = requests.filter((request) => tabConfig.statuses.includes(request.status));
            setFilteredRequests(filtered);
        }
    };
    // End----Tab click handler

    // Start----Pagination click handler
    const handlePaginationClick = (page) => {
        const totalPages = Math.max(1, Math.ceil(filteredRequests.length / REQUESTS_PER_PAGE));
        const nextPage = Math.min(Math.max(page, 1), totalPages);
        setCurrentPage(nextPage);
    };
    // End----Pagination click handler

    const totalRequests = filteredRequests.length;
    const totalPages = Math.max(1, Math.ceil(totalRequests / REQUESTS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pageStartIndex = (safeCurrentPage - 1) * REQUESTS_PER_PAGE;
    const pageEndIndex = Math.min(pageStartIndex + REQUESTS_PER_PAGE, totalRequests);
    const paginatedRequests = filteredRequests.slice(pageStartIndex, pageEndIndex);
    const visiblePageStart = Math.min(
        Math.max(safeCurrentPage - Math.floor(MAX_VISIBLE_PAGE_BUTTONS / 2), 1),
        Math.max(totalPages - MAX_VISIBLE_PAGE_BUTTONS + 1, 1),
    );
    const visiblePageCount = Math.min(MAX_VISIBLE_PAGE_BUTTONS, totalPages);
    const visiblePages = Array.from(
        { length: visiblePageCount },
        (_, index) => visiblePageStart + index,
    );

    if (loading) {
        return <Loader />; // Show loader while navigating to this page or when loader is fetching data
    }
    return (
        <s-page>
            {/* Start----Page Header */}
            <s-grid gridTemplateColumns="auto 1fr" alignItems="center" gap="base" paddingBlock="small large">
                <s-stack direction="inline" alignItems="center" gap="small">
                    <Text as="h2">Requests</Text>
                    <s-badge tone="success" color="strong">Auto-send: On</s-badge>
                </s-stack>
                <s-grid gridTemplateColumns="auto auto auto" gap="small" justifyContent="end">
                    <s-button icon="settings">Request reviews</s-button>
                    <s-button icon="plus">Send manual request</s-button>
                </s-grid>
            </s-grid>
            {/* End----Page Header */}

            {/* Start----Analytics Section */}
            <Analytics data={requests} />
            {/* End----Analytics Section */}

            {/* Start----Page main filter tabs */}
            <s-stack paddingBlock="small base">
                <s-section>
                    <s-grid gridTemplateColumns="repeat(auto-fit, minmax(100px, 1fr))" gap="base">
                        {TAB_CONFIG.map((tab) => (
                            <TabButton
                                key={tab.key}
                                isActive={activeTab === tab.key}
                                onClick={() => handleTabClick(tab.key)}
                            >
                                {tab.label}{" "}
                                <s-badge tone={tab.tone} color="strong">
                                    {tab.statuses
                                        ? requests.filter((request) => tab.statuses.includes(request.status)).length
                                        : requests.length}
                                </s-badge>
                            </TabButton>
                        ))}
                    </s-grid>
                </s-section>
            </s-stack>
            {/* End----Page main filter tabs */}

            {/* Start----Page main content */}
            <s-section>
                {/* Start----Page main content header */}
                <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
                    <s-grid gridTemplateColumns="242px 109px 120px" gap="base">
                        {/* Start----Search field */}
                        <s-search-field
                            placeholder="Search customers..."
                            onChange={(e) => console.log(e.currentTarget.value)}
                        />
                        {/* End----Search field */}
                        {/* Start----Filter options by status */}
                        <s-select>
                            <s-option value="7days" selected>Last 7 days</s-option>
                            <s-option value="30days">Last 30 days</s-option>
                            <s-option value="90days">Last 90 days</s-option>
                        </s-select>
                        {/* End----Filter options by status */}
                    </s-grid>
                    {/* Start----Sort button */}
                    <s-press-button
                        pressed={false}
                        icon="select"
                    >
                        Newest first
                    </s-press-button>
                    {/* End----Sort button */}
                </s-grid>
                {/* End----Page main content header */}

                {/* Start----Requests list */}
                <CustomSection margin="35px 0 0">
                    <s-stack>
                        {totalRequests === 0 ? (
                            <s-stack alignItems="center">
                                <s-text>No {activeTab} requests found</s-text>
                            </s-stack>
                        ) : (
                            paginatedRequests.map((request, index) => (
                                <div key={request.id}>
                                    <s-grid gridTemplateColumns="auto 1fr" gap="base">
                                        <s-checkbox /> {/* Checkbox for selection of requests */}
                                        <RequestItem data={request} />
                                    </s-grid>
                                    {index !== paginatedRequests.length - 1 && (
                                        <s-stack paddingBlock="base">
                                            <s-divider />
                                        </s-stack>
                                    )}
                                </div>
                            ))
                        )}
                    </s-stack>
                </CustomSection>
                {/* End----Requests list */}
                
                {/* Start----Requests pagination */}
                <s-grid gridTemplateColumns="auto 1fr" alignItems="center" paddingBlock="large-300 small">
                    <s-paragraph>
                        Showing <b>{totalRequests === 0 ? 0 : pageStartIndex + 1}-{pageEndIndex}</b> of <b>{totalRequests}</b> requests
                    </s-paragraph>
                    <s-stack direction="inline" gap="small" justifyContent="end">
                        <s-button
                            disabled={safeCurrentPage === 1}
                            onClick={() => handlePaginationClick(safeCurrentPage - 1)}
                        >
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", width: "75px", justifyContent: "center" }}>
                                <s-icon type="arrow-left" />
                                Previous
                            </div>
                        </s-button>
                        {visiblePages.map((page) => (
                            <s-press-button
                                key={page}
                                pressed={safeCurrentPage === page}
                                onClick={() => handlePaginationClick(page)}
                            >
                                {page}
                            </s-press-button>
                        ))}
                        <s-button
                            disabled={safeCurrentPage === totalPages}
                            onClick={() => handlePaginationClick(safeCurrentPage + 1)}
                        >
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", width: "70px", justifyContent: "center" }}>
                                Next
                                <s-icon type="arrow-right" />
                            </div>
                        </s-button>
                    </s-stack>
                </s-grid>
                {/* End----Requests pagination */}
            </s-section>
            {/* End----Page main content */}
        </s-page>
    )
}
