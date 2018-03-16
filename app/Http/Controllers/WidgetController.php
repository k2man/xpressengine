<?php
/**
 * @author      XE Developers <developers@xpressengine.com>
 * @copyright   2015 Copyright (C) NAVER Corp. <http://www.navercorp.com>
 * @license     http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html LGPL-2.1
 * @link        https://xpressengine.io
 */

namespace App\Http\Controllers;

use App\Http\Sections\WidgetSection;
use View;
use XePresenter;
use Xpressengine\Http\Request;
use Xpressengine\Skin\SkinHandler;
use Xpressengine\Support\JsonException;
use Xpressengine\Widget\WidgetHandler;
use Xpressengine\Widget\WidgetParser;

class WidgetController extends Controller
{
    /**
     * index
     *
     * @return mixed
     */
    public function index()
    {
        $widgetSectionView = new WidgetSection('__xe_content');

        return XePresenter::make('widget.index', [
            'widgetSectionView' => $widgetSectionView
        ]);
    }

    public function generate(Request $request, WidgetHandler $widgetHandler)
    {
        $inputs = $request->except('_token');
        $widget = array_get($inputs, '@id');

        $code = $widgetHandler->generateCode($widget, $inputs);

        return XePresenter::makeApi([
            'code' => $code,
        ]);

    }

    /**
     * 주어진 위젯의 스킨 목록을 반환한다.
     *
     * @param Request       $request
     * @param WidgetHandler $widgetHandler
     * @param SkinHandler   $skinHandler
     *
     * @return void
     */
    public function skin(Request $request, SkinHandler $skinHandler)
    {
        $this->validate($request, [
            'widget' => 'required'
        ]);

        $widget = $request->get('widget');

        $skins = $skinHandler->getList($widget);

        return api_render('widget.skins', compact('widget', 'skins'));
    }

    /**
     * 주어진 위젯과 스킨에 대한 설정 폼을 반환한다.
     *
     * @param Request       $request
     * @param WidgetHandler $widgetHandler
     *
     * @param SkinHandler   $skinHandler
     *
     * @return View
     */
    public function form(Request $request, WidgetHandler $widgetHandler, SkinHandler $skinHandler)
    {
        $this->validate($request, [
            'widget' => 'required',
        ]);

        $widget = $request->get('widget');
        $skin = $request->get('skin');

        // widget form
        $widgetForm = $widgetHandler->setup($widget);

        // skin form
        $skinForm = null;
        if($skin !== null) {
            $skin = $skinHandler->get($skin);
            $skinForm = $skin->renderSetting();
        }

        return api_render('widget.form', compact('widget', 'skin', 'widgetForm', 'skinForm'));
    }

    /**
     * setup by code
     *
     * @param Request       $request
     * @param WidgetParser  $widgetParser
     * @param WidgetHandler $widgetHandler
     * @param SkinHandler   $skinHandler
     *
     * @return mixed
     */
    public function setup(Request $request, WidgetParser $widgetParser, WidgetHandler $widgetHandler, SkinHandler $skinHandler)
    {
        $this->validate($request, ['code' => 'required']);

        $code = $request->get('code');

        try {
            $inputs = json_dec($code, true);
        } catch (JsonException $e) {
            $inputs = $widgetParser->parseCode($code);
        }

        $widget = array_get($inputs, '@attributes.id');

        $title = array_get($inputs, '@attributes.title', '');

        // widget list
        $widgetList = $widgetHandler->getAll();
        $widgets = [];
        $widgets[''] = '위젯을 선택하세요';
        foreach ($widgetList as $id => $class) {
            $widgets[$id] = $class::getTitle();
        }

        // skin list
        $skins = $skinHandler->getList($widget);

        // widget form
        $widgetForm = $widgetHandler->setup($widget, $inputs);

        // skin form
        $skin = array_get($inputs, '@attributes.skin-id');
        $skin = $skinHandler->get($skin);
        $skinForm = $skin->renderSetting($inputs);

        return api_render('widget.setup', compact('widgets', 'widget', 'title', 'skins', 'skin', 'widgetSelector', 'skinSelector', 'widgetForm', 'skinForm'));
    }

    /**
     * render
     *
     * @param WidgetHandler $widgetHandler
     *
     * @return mixed
     */
    public function render(Request $request, WidgetHandler $widgetHandler)
    {
        $id = $request->get('widget');
        $args = $request->except('widget');

        $render = $widgetHandler->render($id, $args);

        return $render;
    }

}
