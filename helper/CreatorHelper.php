<?php
namespace OmekaTheme\Helper;

use Laminas\View\Helper\AbstractHelper;
use Omeka\Api\Representation\AbstractResourceEntityRepresentation;

class CreatorHelper extends AbstractHelper
{
    public function __invoke(AbstractResourceEntityRepresentation $resource)
    {
        if ($contributors = $resource->value('dcterms:contributor', ['all' => true])) {
            $creatorList = [];
            foreach ($contributors as $key => $contributor) {
                if (str_contains($contributor->asHtml(), 'Author') || str_contains($contributor->asHtml(), 'Creator') || str_contains($contributor->asHtml(), 'Artist')) {
                    if (!in_array($contributor, $creatorList)) {
                        $creatorList[] = $contributor;
                    }
                }
            }
            if ($creatorList) {
                $invertedCreatorList = [];
                foreach ($creatorList as $creator) {
                    // invert the names
                    if (str_contains($creator, ',')) {
                        // if it contains a number it is likely a birth or death year, ie Madonna, 1958- but might be exceptions :|
                        if (preg_match('~[0-9]+~', explode(",", $creator)[1])) {
                            $invertedName = trim(explode(",", $creator)[0]);
                        } else {
                            $invertedName = trim(explode(",", $creator)[1]) . ' ' . trim(explode(",", $creator)[0]);
                        }

                    } else {
                        $invertedName = $creator;
                    }

                    $invertedCreatorList[] = $invertedName;
                }
                if (count($invertedCreatorList) > 1) {
                    $last = array_pop($invertedCreatorList);
                    $creatorString = implode(', ', $invertedCreatorList) . ' and ' . $last;
                } else {
                    $creatorString = implode(', ', $invertedCreatorList);
                }

                return '
                <div class="contributors fst-italic fw-bold">
                ' . $creatorString . '
                </div>
                ';
            }
        }
    }
}