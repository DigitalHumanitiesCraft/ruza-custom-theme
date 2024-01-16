<?php
namespace OmekaTheme\Helper;

use Laminas\View\Helper\AbstractHelper;
use Omeka\Api\Representation\ItemRepresentation;

class CitationHelper extends AbstractHelper
{
    public function __invoke(ItemRepresentation $item)
    {
        $escape = $this->getView()->plugin('escapeHtml');
        $apaAuthors = '';
        $chicagoAuthors = '';
        $mlaAuthors = '';
        $title = $item->displayTitle();
        $titleCased = $this->titleCase($title);
        $date = $item->value('dcterms:date');
        $thesis = '';
        $chicagoThesis = 'TESTSTSTS';
        $mlaThesis = '<em>MMRC</em>';
        if ($types = $item->value('dcterms:type', ['all' => true])) {
            foreach ($types as $type) {
                if (ucfirst($escape($type)) == "Thesis") {
                    $thesis = ' [Master\'s thesis, Music and Minorities Research Center (MMRC), mdw – Universität für Musik und darstellende Kunst Wien]';
                    $chicagoThesis = 'Master\'s thesis, Music and Minorities Research Center (MMRC), mdw – Universität für Musik und darstellende Kunst Wien';
                    $mlaThesis = 'Music and Minorities Research Center (MMRC), mdw – Universität für Musik und darstellende Kunst Wien, Master\'s thesis. <em>MMRC</em>';
                }
            }
        }
        $url = $escape($item->url());
        if ($contributors = $item->value('dcterms:contributor', ['all' => true])) {
            $authorList = [];
            foreach ($contributors as $key => $contributor) {
                if (str_contains($contributor->asHtml(), 'Author') || str_contains($contributor->asHtml(), 'Creator')) {
                    if (!in_array($contributor, $authorList)) {
                        $authorList[] = $contributor;
                    }
                }
            }
            if (empty($authorList)) {
                $authorList[] = $contributors[0];
            }
            $len = count($authorList);
            foreach ($authorList as $authorKey => $author) {
                $lastName = trim(explode(",", $author)[0]);
                $firstAndMiddle = trim(explode(",", $author)[1]);
                $firstAndMiddleArray = explode(' ', $firstAndMiddle);
                $initials = '';
                foreach ($firstAndMiddleArray as $initialKey => $part) {
                    if ($initialKey == 0) {
                        $initials .= strtoupper($part[0]) . '.';
                    } else {
                        $initials .= ' ' . strtoupper($part[0]) . '.';
                    }
                }
                if ($authorKey == 0) {
                    $apaAuthors .= $lastName . ', ' . $initials;
                    $chicagoAuthors .= $author;
                    $mlaAuthors .= $author;
                } elseif (($len - $authorKey) == 1) {
                    $apaAuthors .= ', & ' . $lastName . ', ' . $initials;
                    $chicagoAuthors .= ', and ' . $firstAndMiddle . ' ' . $lastName;
                    $mlaAuthors .= ', and ' . $firstAndMiddle . ' ' . $lastName;
                } else {
                    $apaAuthors .= ', ' . $lastName . ', ' . $initials;
                    $chicagoAuthors .= ', ' . $firstAndMiddle . ' ' . $lastName;
                }
                if ($len > 2) {
                    $mlaAuthors = $authorList[0] . ', et al';
                }
            }
            $apa = $apaAuthors . ' (' . $date . '). <em>' . $title . '</em>' . $thesis . '. Music and Minorities Research Center (MMRC). ' . $url;
            $chicago = $chicagoAuthors . '. "' . $titleCased . '." ' . $chicagoThesis . ', ' . $date . '. ' . $url;
            $mla = $mlaAuthors . '. <em>' . $titleCased . '</em>. ' . $date . '. ' . $mlaThesis . ', ' . $url;
        } else {
            $apa = '<em>' . $title . '</em>' . $thesis . '. (' . $date . ')' . '. Music and Minorities Research Center (MMRC). ' . $url;
            $chicago = '"' . $titleCased . '." ' . $chicagoThesis . ', ' . $date . '. ' . $url;
            $mla = '<em>' . $titleCased . '</em>. ' . $date . '. ' . $mlaThesis . ', ' . $url;
        }
        return '
        <ul class="nav nav-tabs mb-3" id="citationTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active text-dark" id="apa-tab" data-bs-toggle="tab" data-bs-target="#apa" type="button" role="tab" aria-controls="apa" aria-selected="true">APA</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link text-dark" id="mla-tab" data-bs-toggle="tab" data-bs-target="#mla" type="button" role="tab" aria-controls="mla" aria-selected="false">MLA</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link text-dark" id="chicago-tab" data-bs-toggle="tab" data-bs-target="#chicago" type="button" role="tab" aria-controls="chicago" aria-selected="false">Chicago/Turabian</button>
          </li>
        </ul>
        <div class="tab-content" id="citationTabContent">
          <div class="tab-pane fade show active" id="apa" role="tabpanel" aria-labelledby="apa-tab">
            <div class="input-group mb-3">
              <div class="form-control font-monospace text-break" id="apaCitation">
              ' . str_replace('..', '.', $apa) . '
              </div>
              <button class="btn btn-secondary clip-button" type="button" id="apa-button" data-clipboard-target="#apaCitation" aria-label="Copy citation to clipboard">
                <i class="fas fa-copy" title="Copy citation to clipboard" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          <div class="tab-pane fade" id="mla" role="tabpanel" aria-labelledby="mla-tab">
          <div class="input-group mb-3">
            <div class="form-control font-monospace text-break" id="mlaCitation">
            ' . str_replace('..', '.', $mla) . '
            </div>
            <button class="btn btn-secondary clip-button" type="button" id="mla-button" data-clipboard-target="#mlaCitation" aria-label="Copy citation to clipboard">
              <i class="fas fa-copy" title="Copy citation to clipboard" aria-hidden="true"></i>
            </button>
          </div>
          </div>
          <div class="tab-pane fade" id="chicago" role="tabpanel" aria-labelledby="chicago-tab">
          <div class="input-group mb-3">
            <div class="form-control font-monospace text-break" id="chicagoCitation">
            ' . str_replace('..', '.', $chicago) . '
            </div>
            <button class="btn btn-secondary clip-button" type="button" id="chicago-button" data-clipboard-target="#chicagoCitation" aria-label="Copy citation to clipboard">
              <i class="fas fa-copy" title="Copy citation to clipboard" aria-hidden="true"></i>
            </button>
          </div>
          </div>
        </div>

        ';
    }
    // Converts $title to Title Case, and returns the result.
    protected function titleCase($title)
    {
        $smallwordsarray = array(
      'of','a','the','and','an','or','nor','but','is','if','then','else','when',
      'at','from','by','on','off','for','in','out','over','to','into','with'
      );

        // Split the string into separate words
        $words = explode(' ', $title);

        foreach ($words as $key => $word) {
            // If this word is the first, or it's not one of our small words, capitalise it
            // with ucwords().
            if ($key == 0 or !in_array($word, $smallwordsarray)) {
                $words[$key] = ucwords($word);
            }
        }

        // Join the words back into a string
        $newtitle = implode(' ', $words);

        return $newtitle;
    }
}
