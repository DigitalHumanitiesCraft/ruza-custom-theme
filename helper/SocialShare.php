<?php
namespace OmekaTheme\Helper;

use Laminas\View\Helper\AbstractHelper;
use Omeka\Api\Representation\ItemRepresentation;

class SocialShare extends AbstractHelper
{
    public function __invoke(ItemRepresentation $item)
    {
        $escape = $this->getView()->plugin('escapeHtml');
        $title = $item->displayTitle();
        $url = $escape($item->url());
        $author = $item->value('dcterms:contributor') ? $item->value('dcterms:contributor') . ". " : "";
        $body = 'From the FIT Institutional Repository:%0D%0A' . str_replace('..', '.', $author) . $title . '%0D%0A' . $url;
        $subject =  $item->displayTitle();
        return '
        <!-- Social Share  -->
        <ul id="social-share" class="list-inline mb-0 mt-2 fs-4">
          <li class="list-inline-item">
            <button class="border-0 bg-transparent p-0 clip-button" aria-label="Copy item link" data-clipboard-text="' . $url . '">
              <i class="fas fa-link" title="Copy item link">
              </i>
            </button>
          </li>
          <li class="list-inline-item">
            <a target="_blank" href="mailto:?body=' . $body . '&subject=' . $subject . '">
              <i class="fas fa-envelope" title="Share this item via email">
              </i>
              <span class="sr-only">Share this item via email</span>
            </a>
          </li>
          <li class="list-inline-item">
            <a target="_blank" href="https://www.facebook.com/share.php?u=' . $url . '">
              <i class="fab fa-facebook" title="Share this item on Facebook">
              </i>
              <span class="sr-only">Share this item on Facebook</span>
            </a>
          </li>
          <li class="list-inline-item">
            <a target="_blank" href="https://twitter.com/intent/tweet?url=' . $url . '">
              <i class="fab fa-twitter" title="Share this item on Twitter">
              </i>
              <span class="sr-only">Share this item on Twitter</span>
            </a>
          </li>
        </ul>
        ';
    }
}
