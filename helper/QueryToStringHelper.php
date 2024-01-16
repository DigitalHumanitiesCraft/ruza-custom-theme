<?php
namespace OmekaTheme\Helper;

use Laminas\View\Helper\AbstractHelper;

class QueryToStringHelper extends AbstractHelper
{
    public function __invoke($query, $params, $searchForm)
    {
        $escape = $this->getView()->plugin('escapeHtml');
        $api = $this->getView()->plugin('api');
        $queryStringArray = [];
        if (array_key_exists('q', $query) && ($basicQuery = $query['q'])) {
            $queryLink = $this->removeQueryLink($basicQuery, $query, $params);
            array_push($queryStringArray, $queryLink);
        }

        if (array_key_exists('filters', $query) && array_key_exists('queries', $query['filters']) && ($queryFilters = $query['filters']['queries'])) {
            $availableSearchFields = $searchForm->getAvailableSearchFields();
            foreach ($queryFilters as $queryFilter) {
                if ($queryFilter['term']) {
                    $filterLink = $this->removeFilterLink($queryFilter, $availableSearchFields, $query, $params);
                    array_push($queryStringArray, $filterLink);
                }
            }
        }

        if (array_key_exists('date_range_start', $query) || array_key_exists('date_range_end', $query)) {
            $date_range_start = isset($query['date_range_start']) ? $query['date_range_start'] : '*';
            if (is_array($date_range_start)) {
                $date_range_start = array_filter($date_range_start);
                if (!$date_range_start) {
                    $date_range_start = '*';
                } else {
                    $date_range_start = $date_range_start[0];
                }
            }
            $date_range_end = isset($query['date_range_end']) ? $query['date_range_end'] : '*';
            if (is_array($date_range_end)) {
                $date_range_end = array_filter($date_range_end);
                if (!$date_range_end) {
                    $date_range_end = '*';
                } else {
                    $date_range_end = $date_range_end[0];
                }
            }
            if (($date_range_start != '*') || ($date_range_end != '*')) {
                $dateRangeLink = $this->removeDateRangeLink($date_range_start, $date_range_end, $query, $params);
                array_push($queryStringArray, $dateRangeLink);
            }
        }

        if (array_key_exists('item_set_id', $query) && ($collectionIDs = $query['item_set_id'])) {
            foreach ($collectionIDs as $collectionID) {
                if ($collectionID) {
                    $thisItemSet = $api->read('item_sets', $collectionID)->getContent();
                    $collectionTitle = $thisItemSet->displayTitle();
                    $collectionLink = $this->removeCollectionLink($collectionID, $collectionTitle, $query, $params);
                    array_push($queryStringArray, $collectionLink);
                }
            }
        }

        if (array_key_exists('resource_class_id', $query) && ($resourceClassIDs = $query['resource_class_id'])) {
            foreach ($resourceClassIDs as $resourceClassID) {
                if ($resourceClassID) {
                    $thisResourceClass = $api->read('resource_classes', $resourceClassID)->getContent();
                    $resourceLabel = $thisResourceClass->label();
                    $resourceClassLink = $this->removeResourceClassLink($resourceClassID, $resourceLabel, $query, $params);
                    array_push($queryStringArray, $resourceClassLink);
                }
            }
        }
        if (array_key_exists('limit', $query) && ($queryFacets = $query['limit'])) {
            $facetLinkHelper = $this->getView()->plugin('facetLink');
            foreach ($queryFacets as $queryFacetName => $queryFacetValues) {
                foreach ($queryFacetValues as $queryFacetValue) {
                    $facetLink = $this->removeFacetLink($query, $params, $queryFacetName, $queryFacetValue);
                    array_push($queryStringArray, $facetLink);
                }
            }
        }

        $html = '<ul id="current-search" class="list-inline">';
        foreach ($queryStringArray as $key => $queryString) {
            $html .= '<li class="list-inline-item">' . $queryString . '</li>';
        }
        $html .= '</ul>';
        return $html;
    }

    protected function removeQueryLink($basicQuery, $query, $params)
    {
        if (array_key_exists('suggester', $query) && ($query['suggester'] == 'true')) {
            unset($query['page']);
            if ($basicQuery) {
                $basicQuery = stripslashes($basicQuery);
                if ((substr($basicQuery, 0, 1) == '"') && (substr($basicQuery, -1, 1) == '"')) {
                    $basicQuery = substr(substr($basicQuery, 1), 0, -1);
                }
            }
        }
        if (array_key_exists('label', $query) && ($label = $query['label'])) {
            $basicQuery = $label . ' (' . $basicQuery . ')';
            unset($query['label']);
        }
        $escape = $this->getView()->plugin('escapeHtml');
        $query['q'] = "";
        unset($query['page']);
        $url = $this->getView()->url('site/search', $params, ['query' => $query]);
        return '<a href="' . $escape($url) . '" class="link-secondary text-decoration-none"><i aria-hidden="true" title="Remove search term:" class="far fa-times-circle"></i><span class="visually-hidden">Remove search term:</span> ' . $escape($basicQuery) . '</a>';
    }

    protected function removeFilterLink($queryFilter, $availableSearchFields, $query, $params)
    {
        $escape = $this->getView()->plugin('escapeHtml');
        $label = $availableSearchFields[$queryFilter['field']]['label'];
        $queryFilterString = $label . ': ' . '"' . $queryFilter['term'] . '"';
        $values = [];
        foreach ($query['filters']['queries'] as $queryFilterMatch) {
            if ($queryFilterMatch != $queryFilter) {
                array_push($values, $queryFilterMatch);
            }
        }
        $query['filters']['queries'] = $values;
        unset($query['page']);
        $url = $this->getView()->url('site/search', $params, ['query' => $query]);
        return '<a href="' . $escape($url) . '" class="link-secondary text-decoration-none"><i aria-hidden="true" title="Remove search term:" class="far fa-times-circle"></i><span class="visually-hidden">Remove search term:</span> ' . $escape($queryFilterString) . '</a>';
    }

    protected function removeDateRangeLink($date_range_start, $date_range_end, $query, $params)
    {
        $escape = $this->getView()->plugin('escapeHtml');
        //There should only ever be one date range, so it can just be set to a blank array
        $query['date_range_start'] = [""];
        $query['date_range_end'] = [""];
        unset($query['page']);
        $url = $this->getView()->url('site/search', $params, ['query' => $query]);
        $dateRangeString = 'Date range: ' . $date_range_start . ' to ' . $date_range_end;
        return '<a href="' . $escape($url) . '" class="link-secondary text-decoration-none"><i aria-hidden="true" title="Remove search term:" class="far fa-times-circle"></i><span class="visually-hidden">Remove search term:</span> ' . $escape($dateRangeString) . '</a>';
    }

    protected function removeCollectionLink($collectionID, $collectionTitle, $query, $params)
    {
        $escape = $this->getView()->plugin('escapeHtml');
        $values = [];
        foreach ($query['item_set_id'] as $collectionIDMatch) {
            if ($collectionIDMatch != $collectionID) {
                array_push($values, $collectionIDMatch);
            }
        }
        $query['item_set_id'] = $values;
        unset($query['page']);
        $url = $this->getView()->url('site/search', $params, ['query' => $query]);
        $collectionString = 'Collection: ' . $collectionTitle;
        return '<a href="' . $escape($url) . '" class="link-secondary text-decoration-none"><i aria-hidden="true" title="Remove search term:" class="far fa-times-circle"></i><span class="visually-hidden">Remove search term:</span> ' . $escape($collectionString) . '</a>';
    }

    protected function removeResourceClassLink($resourceClassID, $resourceLabel, $query, $params)
    {
        $escape = $this->getView()->plugin('escapeHtml');
        $values = [];
        foreach ($query['resource_class_id'] as $resourceClassIDMatch) {
            if ($resourceClassIDMatch != $resourceClassID) {
                array_push($values, $resourceClassIDMatch);
            }
        }
        $query['resource_class_id'] = $values;
        unset($query['page']);
        $url = $this->getView()->url('site/search', $params, ['query' => $query]);
        $resourceString = 'Resource class: ' . $resourceLabel;
        return '<a href="' . $escape($url) . '" class="link-secondary text-decoration-none"><i aria-hidden="true" title="Remove search term:" class="far fa-times-circle"></i><span class="visually-hidden">Remove search term:</span> ' . $escape($resourceString) . '</a>';
    }


    protected function removeFacetLink($query, $params, $name, $facet)
    {
        $escape = $this->getView()->plugin('escapeHtml');
        $values = $query['limit'][$name];
        $values = array_filter($values, function ($v) use ($facet) {
            return $v != $facet;
        });
        $query['limit'][$name] = $values;
        unset($query['page']);
        $url = $this->getView()->url('site/search', $params, ['query' => $query]);
        return '<a href="' . $escape($url) . '" class="link-secondary text-decoration-none"><i aria-hidden="true" title="Remove facet:" class="far fa-times-circle"></i><span class="visually-hidden">Remove facet:</span> ' . $escape($facet) . '</a>';
    }
}
